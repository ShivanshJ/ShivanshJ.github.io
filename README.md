# Portfolio — Shivansh Jagga

Single-page personal site. Astro (SSG) + Tailwind, dark macOS-desktop
metaphor with draggable windows and a WebGL dithered wallpaper. Deploys
to GitHub Pages on every push to `main`. Analytics runs on a separate
Cloudflare Worker.

Live: **https://shivanshj.github.io/**

---

## Local dev

```bash
nvm use              # Node 20+
npm install
npm run dev          # http://localhost:4321
```

Preview a production build locally:

```bash
npm run build        # → dist/
npm run preview
```

## Deploy — the site

**Automatic.** Every `git push origin main` triggers
`.github/workflows/deploy.yml`, which builds `dist/` and publishes it to
GitHub Pages. No manual step. Live URL: https://shivanshj.github.io/.

Nothing else deploys the site. Do **not** run `astro add cloudflare` — it
adds a Cloudflare adapter to `astro.config.mjs`, a `wrangler.jsonc` at
root, and stealth-edits `package.json` scripts. All three break the GH
Pages build. If you ever see `wrangler.jsonc` reappear, delete it.

## Deploy — the analytics worker

Separate system, entirely on Cloudflare. From anywhere in the repo:

```bash
npm run deploy:worker      # cd into worker/ + wrangler deploy
```

Full details (Cloudflare login, D1 setup, admin token, campaign URLs,
smoke-testing) live in [`worker/README.md`](./worker/README.md).

## Editing content

| Change | Where |
|---|---|
| A role in the Work window | `src/content/work/*.mdx` — frontmatter for header/metrics/stack, markdown body for bullets |
| Signal tiles (education, awards) | `signals` array in `src/components/Desktop.astro` |
| Contact info | `src/data/site.ts` (email, phone, socials) — one source of truth |
| Hero name / tagline | `src/data/site.ts` (`name`, `tagline`) |
| README window text | `src/components/windows/ReadmeWindow.astro` |
| Resume PDF | `public/resume.pdf` — replace the file |
| Design tokens (colors, spacing) | `src/styles/global.css` `:root` |
| Shared window styles | `src/styles/desktop.css` |

## Repo layout

```
portfolio/
├── .github/workflows/deploy.yml       # → GH Pages
├── astro.config.mjs                   # output: 'static'
├── src/
│   ├── pages/index.astro              # only page — renders <Desktop/>
│   ├── layouts/Base.astro             # meta, fonts, analytics beacon
│   ├── data/site.ts                   # personal info (single source of truth)
│   ├── components/
│   │   ├── Desktop.astro              # orchestrator (~65 lines)
│   │   ├── PixelSky.astro             # WebGL dithered wallpaper
│   │   ├── desktop/                   # HeroPlate, MenuBar, Dock, Window,
│   │   │                              # DesktopIcon, WorkRecord, SignalTile
│   │   └── windows/                   # ReadmeWindow, WorkWindow, SignalWindow,
│   │                                  # ContactWindow, SnakeWindow, AdminWindow
│   ├── content/work/*.mdx             # one file per role
│   ├── scripts/                       # desktop.ts (window manager),
│   │                                  # scramble.ts, highlight-prose.ts
│   └── styles/                        # global.css + desktop.css
└── worker/                            # analytics — Cloudflare Worker + D1
    ├── src/worker.ts
    ├── wrangler.toml                  # name = "portfolio-hits"
    ├── schema.sql
    └── README.md                      # full analytics setup + usage
```

## Design notes

See `docs/superpowers/specs/2026-09-01-portfolio-design.md` for the full
design system (locally only; `docs/` is gitignored so it doesn't ship
with the public repo).
