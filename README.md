# Junk & Dump Rental

One-page site for Junk & Dump Rental, a husband-and-wife dump trailer rental serving the Florida Panhandle, from Pensacola to Mexico Beach, including 30A.

Plain HTML, CSS, and vanilla JavaScript. No build step.

- `index.html` — the page (meta, Open Graph, LocalBusiness JSON-LD)
- `styles.css` — all styles (mobile-first)
- `script.js` — mobile menu, FAQ accordion, sticky call bar, quote-form validation and Web3Forms submit
- `CNAME` — custom domain for GitHub Pages (`www.oncommandresponse.com`)
- `assets/` — logo, favicon, apple-touch icon, Open Graph image
- `PLACEHOLDERS.md` — details the owners still need to confirm

## Local preview

Asset paths are relative, so the page works at the domain root:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/

## Hosting

Pushes to `main` run `.github/workflows/pages.yml`, which uploads the static files (including `CNAME`) and deploys them with GitHub Actions.

Live URL: https://www.oncommandresponse.com/
