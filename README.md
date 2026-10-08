# Junk & Dump Rental

One-page site for Junk & Dump Rental, a husband-and-wife dump trailer rental serving Destin to Panama City Beach, FL, including 30A.

Plain HTML, CSS, and vanilla JavaScript. No build step.

- `index.html` — the page (meta, Open Graph, LocalBusiness JSON-LD)
- `styles.css` — all styles (mobile-first)
- `script.js` — mobile menu, FAQ accordion, sticky call bar, quote-form validation and mailto
- `assets/` — logo, favicon, apple-touch icon, Open Graph image
- `PLACEHOLDERS.md` — details the owners still need to confirm

## Local preview

GitHub Pages serves this site from the `/Junk-Dump-/` subpath. Preview it the same way:

```bash
mkdir -p /tmp/gh-pages-preview
ln -sfn "$(pwd)" /tmp/gh-pages-preview/Junk-Dump-
python3 -m http.server 8000 --directory /tmp/gh-pages-preview
```

Open http://localhost:8000/Junk-Dump-/

Asset, stylesheet, and script paths are relative, so they resolve under that subpath.

## Hosting

Pushes to `main` run `.github/workflows/pages.yml`, which uploads the static files and deploys them with GitHub Actions.

Live URL (until a custom domain is added): https://ntxhail.github.io/Junk-Dump-/

In the repo, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** if it is not already.
