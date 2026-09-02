# Portfolio — Shivansh Jagga

Single-page personal portfolio. Astro + Tailwind, static output, dark theme.

## Local dev

```bash
nvm use            # Node 20+ (24 works)
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # → dist/
npm run preview    # serve dist/ locally
```

## Deploy to Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo** → select this repo.
3. Railway reads `railway.json`, runs `npm ci && npm run build`, then serves `dist/` via the `serve` package on `$PORT`.
4. First deploy assigns a `*.up.railway.app` subdomain. Attach a custom domain later via **Settings → Networking**.

No env vars required.

## Editing content

- **Role cards** live in `src/content/work/*.mdx` — one file per role. Edit frontmatter for display fields; edit the markdown body for the details bullet list.
- **Signal tiles** (achievements) are in `src/components/SignalSection.astro`.
- **Contact info** is in `src/components/Contact.astro`.
- **Resume PDF** is `public/resume.pdf` — replace to update.

## Owner TODOs

- [ ] Fill in the company name for the Jun–Dec 2022 role in `src/content/work/company-tbd-2022.mdx` (rename the file too if you want a nicer slug)
- [ ] Replace placeholder GitHub / LinkedIn URLs in `src/components/Hero.astro` and `src/components/Contact.astro`
- [ ] Provide the URL for the "recent side project" in `src/components/SignalSection.astro` — pass an `href` prop to that tile
- [ ] Optionally add a proper `og-image.png` in `public/` and reference it from `src/layouts/Base.astro`

## Design tokens

Edit `src/styles/global.css` `:root` to change the palette. Tailwind classes reference these via `bg-bg`, `text-accent`, `border-border`, etc.
