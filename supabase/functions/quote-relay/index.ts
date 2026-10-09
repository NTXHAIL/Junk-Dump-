// Junk & Dump quote relay: website quote form -> GoHighLevel contact + opportunity.
// Deployed as the Supabase Edge Function "quote-relay" (project wjjmbowcxzoqmxdkwpse, verify_jwt=false).
// The GHL Private Integration token is read at runtime from the RLS-locked app_secrets table
// (name = 'GHL_PIT'). It is NEVER stored in this repo or in client code.
//
// Changes vs. the deployed v1 (not deployed yet - review, then deploy with
// `supabase functions deploy quote-relay --no-verify-jwt`):
//   * Fills the GHL custom fields "Service type" and "Service address" so leads are filterable.
//   * Logs token errors (401) clearly so a rotated token is obvious in quote_relay_log.
//   * Clears the cached token on 401 so an updated app_secrets value is picked up without redeploy.
const LOCATION_ID = "4I1ppkMrOc6vzv1elNAe";
const PIPELINE_ID = "BrQl8yM71VgwYgLDo8Wc"; // Marketing Pipeline
const STAGE_ID = "73435193-2afb-481d-91f4-7ea43e8d6364"; // New Lead
const CF_SERVICE_TYPE = "uJXBZcw1HNbOkTineP42";    // contact.service_type (single option)
const CF_SERVICE_ADDRESS = "XHEOQ5kQ9U2VGe6DEKoI"; // contact.service_address (text)
const SERVICE_TYPE_MAP: Record<string, string> = {
  "Direct trailer rental": "Direct trailer rental",
  "Driveway trailer drop": "Driveway trailer drop",
  "Hurricane/storm clean-up services": "Storm clean-up drop-off",
};
const GHL = "https://services.leadconnectorhq.com";
const ALLOWED = [
  "https://www.oncommandresponse.com", "https://oncommandresponse.com",
  "http://www.oncommandresponse.com", "http://oncommandresponse.com",
  "https://ntxhail.github.io",
];
const PROJECTS = Object.keys(SERVICE_TYPE_MAP);
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
let cachedToken: string | null = null;

function cors(origin: string | null) {
  const o = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type", "Vary": "Origin", "Content-Type": "application/json" };
}
const sb = (path: string, init: RequestInit = {}) => fetch(SB_URL + "/rest/v1/" + path, { ...init,
  headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json", ...(init.headers || {}) } });

async function token() {
  if (cachedToken) return cachedToken;
  const r = await sb("app_secrets?name=eq.GHL_PIT&select=value");
  const rows = await r.json();
  cachedToken = rows?.[0]?.value ?? null;
  if (!cachedToken) throw new Error("token missing");
  return cachedToken;
}
async function ghl(method: string, path: string, body?: unknown) {
  const r = await fetch(GHL + path, { method, headers: { Authorization: "Bearer " + await token(), Version: "2021-07-28",
    Accept: "application/json", "Content-Type": "application/json", "User-Agent": "junk-dump-quote-relay/1.1" },
    body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401) cachedToken = null; // pick up a rotated token on the next request
  const text = await r.text();
  let data: any = null; try { data = JSON.parse(text); } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
}
const s = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function log(row: Record<string, unknown>) { try { await sb("quote_relay_log", { method: "POST", body: JSON.stringify(row), headers: { Prefer: "return=minimal" } }); } catch { /* ignore */ } }

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const h = cors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method === "GET") { // health / keep-alive (touches the DB so the free project stays active)
    const r = await sb("quote_relay_log?select=id&limit=1");
    return new Response(JSON.stringify({ ok: r.ok }), { headers: h });
  }
  if (req.method !== "POST") return new Response('{"ok":false}', { status: 405, headers: h });
  if (!origin || !ALLOWED.includes(origin)) return new Response('{"ok":false}', { status: 403, headers: h });

  let d: any; try { d = await req.json(); } catch { return new Response('{"ok":false}', { status: 400, headers: h }); }
  if (d.botcheck === true || d.botcheck === "on") return new Response('{"ok":true}', { headers: h }); // honeypot
  const name = s(d.name, 100), phone = s(d.phone, 40), email = s(d.email, 120).toLowerCase();
  const address = s(d.address, 200), date = s(d.date, 20), notes = s(d.notes, 2000);
  const project = PROJECTS.includes(s(d.project)) ? s(d.project) : "Other";
  if (name.length < 2 || (phone.replace(/\D/g, "").length < 10 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)))
    return new Response('{"ok":false}', { status: 400, headers: h });

  const parts = name.split(/\s+/);
  const customFields: { id: string; field_value: string }[] = [];
  if (SERVICE_TYPE_MAP[project]) customFields.push({ id: CF_SERVICE_TYPE, field_value: SERVICE_TYPE_MAP[project] });
  if (address) customFields.push({ id: CF_SERVICE_ADDRESS, field_value: address });
  const contact: Record<string, unknown> = { locationId: LOCATION_ID, name, firstName: parts[0],
    lastName: parts.slice(1).join(" ") || undefined, source: "Website", customFields };
  if (email) contact.email = email;
  if (phone) contact.phone = phone;
  if (/^\d{5}(-\d{4})?$/.test(address)) contact.postalCode = address; else if (address) contact.address1 = address;

  try {
    const up = await ghl("POST", "/contacts/upsert", contact);
    const contactId = up.data?.contact?.id;
    if (up.status === 401) throw new Error("GHL token rejected (401) - update app_secrets GHL_PIT with the current Private Integration token");
    if (!up.ok || !contactId) throw new Error("contact upsert " + up.status + " " + JSON.stringify(up.data).slice(0, 300));
    await ghl("POST", `/contacts/${contactId}/tags`, { tags: ["website-quote", "project-" + slug(project)] });
    const noteBody = ["Website quote request", "Project: " + project, "Preferred drop-off date: " + (date || "not given"),
      "Address/ZIP: " + (address || "not given"), "Phone: " + phone, "Email: " + email, "Notes: " + (notes || "none")].join("\n");
    await ghl("POST", `/contacts/${contactId}/notes`, { body: noteBody });
    const opp = { pipelineId: PIPELINE_ID, locationId: LOCATION_ID, pipelineStageId: STAGE_ID, status: "open",
      contactId, name: `${name} - ${project}`.slice(0, 150), source: "Website" };
    let o = await ghl("POST", "/opportunities/", opp);
    if (!o.ok) o = await ghl("POST", "/opportunities/upsert", opp); // e.g. contact already has an open opportunity
    const opportunityId = o.data?.opportunity?.id ?? o.data?.id ?? null;
    await log({ project, ok: !!opportunityId, ghl_contact_id: contactId, ghl_opportunity_id: opportunityId,
      error: opportunityId ? null : ("opportunity " + o.status + " " + JSON.stringify(o.data).slice(0, 300)) });
    return new Response(JSON.stringify({ ok: true, contactId, opportunityId }), { headers: h });
  } catch (e) {
    await log({ project, ok: false, error: String(e).slice(0, 500) });
    return new Response('{"ok":false}', { status: 502, headers: h });
  }
});
