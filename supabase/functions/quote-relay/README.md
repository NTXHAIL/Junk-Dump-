# quote-relay (Supabase Edge Function)

The website quote form (`script.js`) posts each lead to this function and to Web3Forms at the same time.
This function adds the lead to GoHighLevel as a contact (tags `website-quote` + `project-...`, a note, and
the Service type/Service address custom fields) and an open opportunity in **Marketing Pipeline → New Lead**.
Web3Forms email stays as the backup.

- Supabase project: `wjjmbowcxzoqmxdkwpse`, function `quote-relay`, JWT verification **off** (public form endpoint, origin-locked by CORS allow-list).
- Secret: the GHL Private Integration token is stored in the RLS-locked table `app_secrets` (row `name = 'GHL_PIT'`). **Never commit it.**
- Log: every attempt is written to `quote_relay_log` (ok, contact id, opportunity id, error).

## If GHL leads stop showing up

1. Check `select * from quote_relay_log order by id desc limit 10;` in the Supabase SQL editor.
2. `contact upsert 401 ... Invalid Private Integration token` means the GHL token was rotated or deleted.
   Create or copy the current Private Integration token in GHL (Settings → Private Integrations) and paste it into
   Supabase Table Editor → `app_secrets` → row `GHL_PIT` → `value`. No redeploy is needed with this version (v1 caches the
   token per instance, so it can take a few minutes to pick up).

## Deploy

```bash
supabase functions deploy quote-relay --project-ref wjjmbowcxzoqmxdkwpse --no-verify-jwt
```
