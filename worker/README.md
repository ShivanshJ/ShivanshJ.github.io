# hits — analytics for shivanshj.github.io

Tiny Cloudflare Worker + D1 (SQLite) that counts visits per `?cmp=<name>`
campaign. One row per visit. Free tier covers everything.

---

## Setup (one time, ~5 min)

1. **Cloudflare account** — sign up at https://dash.cloudflare.com/sign-up
   (email + password, no card). Skip if you have one.

2. From this `worker/` folder, run:

   ```bash
   npm install
   npx wrangler login                                # browser popup
   npx wrangler d1 create portfolio-hits             # copy the printed database_id
   ```

3. Open `wrangler.toml` and paste the `database_id` into the placeholder.

4. Set the admin token (any string, 20+ chars, save in a password manager):

   ```bash
   npx wrangler secret put ADMIN_TOKEN
   # → prompts you to type the value; stored encrypted, never in the repo
   ```

   > If you see **`Required Worker name missing`**, you're running from the
   > wrong folder. Wrangler only auto-reads `wrangler.toml` from the current
   > directory. Fix with either:
   > ```bash
   > cd worker && npx wrangler secret put ADMIN_TOKEN
   > # or, from anywhere:
   > npx wrangler secret put ADMIN_TOKEN --name portfolio-hits
   > ```
   > Same rule applies to `wrangler d1 execute` and `wrangler deploy`
   > — always run them from the `worker/` folder, or pass `--name portfolio-hits`.

5. Create the table + deploy:

   ```bash
   npx wrangler d1 execute portfolio-hits --remote --file=./schema.sql
   wrangler deploy
   ```

Wrangler prints the live URL (e.g. `https://portfolio-hits.YOUR-ACCOUNT.workers.dev`).
Paste that URL into `../src/data/site.ts` (the `analyticsEndpoint` field),
commit, push. Done.

---

## Verify the worker is live

Opening the base URL in a browser shows a blank / 404 page — the worker
only responds to `POST /hit` and `GET /stats`, not `/`. That's expected.

**Copy-paste smoke test.** Only change the `TOKEN=` line to your actual
admin token, then run the whole block:

```bash
TOKEN=paste-your-token-here

# 1. POST a fake hit — expect HTTP/2 204
curl -i -X POST -H "Content-Type: application/json" \
  -d '{"campaign":"smoke-test","session_id":"test","referrer":null}' \
  https://portfolio-hits.portfolio-shivanshj.workers.dev/hit

# 2. Fetch stats WITH the correct token — expect HTTP/2 200 + JSON
curl -i "https://portfolio-hits.portfolio-shivanshj.workers.dev/stats?key=$TOKEN"

# 3. Fetch stats WITHOUT a token — expect HTTP/2 401
curl -i https://portfolio-hits.portfolio-shivanshj.workers.dev/stats

# 4. CORS preflight (what the browser sends before the beacon) — expect HTTP/2 204
#    with header: access-control-allow-origin: https://shivanshj.github.io
curl -i -X OPTIONS \
  -H "Origin: https://shivanshj.github.io" \
  -H "Access-Control-Request-Method: POST" \
  https://portfolio-hits.portfolio-shivanshj.workers.dev/hit
```

| Test | Expected | If wrong |
|---|---|---|
| 1. POST /hit | `HTTP/2 204` | 404 → worker not deployed. 500 → run `npm run tail` to see the DB error. |
| 2. GET /stats?key=… | `HTTP/2 200` + JSON | 401 with correct token → secret not set; run `wrangler secret put ADMIN_TOKEN`. |
| 3. GET /stats (no key) | `HTTP/2 401` | 404 → worker not deployed. |
| 4. OPTIONS /hit | `HTTP/2 204` + CORS header | Missing/wrong CORS header → check `ALLOWED_ORIGIN` in `wrangler.toml`. |

**All 404s?** Worker code isn't live. From this folder:

```bash
npx wrangler deployments list       # shows the deploy history
npm run deploy                      # (re)deploy
```

---

## Sending campaign links

Any URL param `?cmp=<name>` gets tagged in the counter:

```
https://shivanshj.github.io/?cmp=acme
https://shivanshj.github.io/?cmp=stripe
https://shivanshj.github.io/?cmp=hn-launch
```

The name is anything you want — one per company / channel / context.
`?campaign=<name>` also works as an alias.

## Don't count yourself

Visit once per browser:

```
https://shivanshj.github.io/?dnt=1
```

Sets a permanent localStorage flag; that browser never fires the beacon
again. Send the same link to friends. The `/admin` page is also auto-
excluded, so viewing your own dashboard doesn't self-count.

## View the dashboard

```
https://shivanshj.github.io/admin?key=<YOUR_ADMIN_TOKEN>
```

Shows totals, per-campaign breakdown, geo, browsers, OSes, referrers, and
recent visits.

---

## Where things live in the Cloudflare dashboard

Log in at https://dash.cloudflare.com/.

| Thing | Path |
|---|---|
| Worker (logs, metrics, settings) | Workers & Pages → **portfolio-hits** |
| Env vars + secrets (see they exist; can't read values back) | ↳ Settings → Variables and Secrets |
| D1 database | Workers & Pages → **D1 SQL Database** → **portfolio-hits** |
| Run `SELECT * FROM hits;` in-browser | ↳ Console tab |
| Custom domain later | Worker → Settings → Triggers → Custom Domains |

---

## Common tasks

**Change the admin token:**
```bash
npx wrangler secret put ADMIN_TOKEN         # enter new value; old one dies instantly
```

**Tail live logs (great for confirming a hit registered):**
```bash
npm run tail
```

**Query the raw table:**
```bash
npx wrangler d1 execute portfolio-hits --remote --command="SELECT * FROM hits ORDER BY ts DESC LIMIT 10;"
```

**Nuke all data:**
```bash
npx wrangler d1 execute portfolio-hits --remote --command="DELETE FROM hits;"
```

---

## Free-tier limits (nothing bills silently)

- 100k Worker requests / day
- 100k D1 rows written / day (≈ 1 visit per second sustained)
- 5 GB D1 storage (≈ 25M hits at 200 bytes each)

Over-limit responses return 429, not a bill.
