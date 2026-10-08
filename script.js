/* Junk & Dump Rental – small vanilla JS helpers */
(function () {
  "use strict";

  // ---- CONFIG -------------------------------------------------------------
  // Inbox that receives quote requests (opens a prefilled email to this address).
  var QUOTE_EMAIL = "saltnsun30a@gmail.com";

  // To send submissions straight to an inbox without the visitor's email app,
  // create a free form at https://formspree.io, then set:
  //   USE_FORMSPREE = true
  //   FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"
  // (Netlify Forms, Basin, Getform etc. work the same way: POST the FormData.)
  var USE_FORMSPREE = false;
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

  // ---- Footer year --------------------------------------------------------
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- Header shadow on scroll -------------------------------------------
  var header = document.querySelector(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav ---------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
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
  var dateInput = form.querySelector("#q-date");
  var projectSelect = form.querySelector("#q-project");

  // No past dates for drop-off
  var t = new Date();
  dateInput.min = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-");

  // Pricing buttons preselect the project type
  document.querySelectorAll("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () { projectSelect.value = btn.getAttribute("data-project"); });
  });

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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    var firstBad = null;
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (!validateField(el) && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }

    var d = new FormData(form);
    var lines = [
      "Name: " + d.get("name"),
      "Phone: " + d.get("phone"),
      "Email: " + d.get("email"),
      "Address / ZIP: " + d.get("address"),
      "Project type: " + d.get("project"),
      "Preferred drop-off date: " + (d.get("date") || "Flexible"),
      "",
      "Notes:",
      d.get("notes") || "(none)"
    ];

    if (USE_FORMSPREE) {
      fetch(FORMSPREE_ENDPOINT, { method: "POST", body: d, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.textContent = "Thanks! We got your request and will be in touch soon.";
        })
        .catch(function () { status.textContent = "Something went wrong. Please call or text us instead."; });
      return;
    }

    var subject = "Quote request: " + d.get("project") + " – " + d.get("name");
    var href = "mailto:" + QUOTE_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = href;
    status.textContent = "Opening your email app with your request filled in. Just hit send!";
  });
})();
