/* Junk & Dump Rental – small vanilla JS helpers */
(function () {
  "use strict";

  // ---- CONFIG -------------------------------------------------------------
  // Public Web3Forms access key. Safe in client code; it only accepts this form.
  var WEB3FORMS_URL = "https://api.web3forms.com/submit";
  var WEB3FORMS_KEY = "1e1f20a8-99ea-4e24-aa55-d306b7e794d7";
  // CRM relay (Supabase Edge Function) that adds each quote to GoHighLevel as a
  // contact + opportunity. No secrets here: the GHL token stays server-side.
  var CRM_RELAY_URL = "https://wjjmbowcxzoqmxdkwpse.supabase.co/functions/v1/quote-relay";

  // ---- Footer year --------------------------------------------------------
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- Header shadow on scroll -------------------------------------------
  var header = document.querySelector(".site-header");
  var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav ---------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  if (toggle && nav) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  if (nav) nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  // ---- Mobile call bar: show only after the hero CTAs are off-screen,
  //      and hide again while the quote form is on screen ----
  var bar = document.querySelector(".mobile-bar");
  var heroCtas = document.querySelector(".hero-ctas");
  var quoteSec = document.getElementById("quote");
  if (bar && heroCtas && "IntersectionObserver" in window) {
    var heroVisible = true, quoteVisible = false;
    var update = function () { bar.classList.toggle("show", !heroVisible && !quoteVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }).observe(heroCtas);
    if (quoteSec) new IntersectionObserver(function (es) { quoteVisible = es[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(quoteSec);
  } else if (bar) {
    bar.classList.add("show");
  }

  // ---- FAQ: one open at a time (fallback for browsers without <details name>) ----
  var details = document.querySelectorAll(".faq details");
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // ---- Quote form ---------------------------------------------------------
  var form = document.getElementById("quote-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  // The waiting list page reuses this same code path (form has data-waitlist="true").
  // The project type is sent as "Waiting list - <type>" so it is easy to tell apart
  // in the backup email and in GoHighLevel.
  var isWaitlist = form.getAttribute("data-waitlist") === "true";
  var dateInput = form.querySelector('[name="date"]');
  var projectSelect = form.querySelector('[name="project"]');

  // No past dates for drop-off
  var t = new Date();
  dateInput.min = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-");

  // Links like quote.html?project=Direct%20trailer%20rental preselect the project type
  try {
    var wanted = new URLSearchParams(window.location.search).get("project");
    if (wanted && projectSelect) {
      Array.prototype.forEach.call(projectSelect.options, function (o) {
        if (o.value === wanted || o.text === wanted) projectSelect.value = o.value;
      });
    }
  } catch (err) { /* ignore */ }

  var rules = {
    name: function (v) { return v.trim().length >= 2 || "Please enter your name."; },
    phone: function (v) { return v.replace(/\D/g, "").length >= 10 || "Please enter a 10-digit phone number."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email."; },
    address: function (v) { return v.trim().length >= 5 || "Please enter your address or ZIP code."; },
    project: function (v) { return v !== "" || "Please choose a project type."; },
    date: function (v) { return !v || v >= dateInput.min || "Please pick today or a future date."; }
  };

  function validateField(el) {
    var rule = rules[el.name];
    if (!rule) return true;
    var result = rule(el.value);
    var field = el.closest(".field");
    var err = field.querySelector(".error");
    var ok = result === true;
    field.classList.toggle("invalid", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    if (err) err.textContent = ok ? "" : result;
    return ok;
  }

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("blur", function () { validateField(el); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("invalid")) validateField(el); });
  });

  var submitBtn = form.querySelector('[type="submit"]');
  var botcheck = form.querySelector('[name="botcheck"]');

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error");
    var firstBad = null;
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (el.name === "botcheck") return;
      if (!validateField(el) && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }

    var d = new FormData(form);
    var projectLabel = isWaitlist ? "Waiting list - " + d.get("project") : d.get("project");
    var notesText = d.get("notes") || "";
    if (isWaitlist) notesText = "[WAITING LIST] " + notesText;
    var payload = {
      access_key: WEB3FORMS_KEY,
      subject: (isWaitlist ? "New waiting list signup: " : "New quote request: ") + d.get("project") + " - " + d.get("name"),
      from_name: "Junk & Dump website",
      replyto: String(d.get("email") || "").trim(),
      name: d.get("name"),
      phone: d.get("phone"),
      email: d.get("email"),
      address: d.get("address"),
      project: projectLabel,
      date: d.get("date") || "",
      notes: notesText,
      botcheck: !!(botcheck && botcheck.checked)
    };

    // Copy the lead into GoHighLevel in parallel. Fire-and-forget: it never
    // blocks, delays or changes the email submission or the thank-you message.
    try {
      fetch(CRM_RELAY_URL, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name, phone: payload.phone, email: payload.email, address: payload.address,
          project: payload.project, date: payload.date, notes: payload.notes, botcheck: payload.botcheck
        })
      }).catch(function () {});
    } catch (err) { /* ignore */ }

    submitBtn.disabled = true;
    fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok || !body || body.success !== true) throw new Error();
        });
      })
      .then(function () {
        form.reset();
        status.classList.remove("is-error");
        status.textContent = isWaitlist
          ? "You're on the list! We'll call or text you as soon as a trailer opens up."
          : "Thanks! We got your request and will call or text you soon.";
      })
      .catch(function () {
        status.classList.add("is-error");
        status.textContent = "Something went wrong. Please call or text us instead.";
      })
      .then(function () { submitBtn.disabled = false; });
  });
})();
