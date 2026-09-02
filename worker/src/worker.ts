// Cloudflare Worker: campaign hit counter for shivanshj.github.io.
// Storage: D1 (one row per visit). Two endpoints:
//   POST /hit    — record a visit (called by the site's beacon)
//   GET  /stats  — return aggregated stats (gated by ?key=ADMIN_TOKEN)

export interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  ALLOWED_ORIGIN: string;
}

// ALLOWED_ORIGIN in env is a comma-separated list; we echo back whichever
// one matches the request's Origin. Any other origin gets no CORS header
// (browser blocks). This lets us allow prod + localhost dev at the same time.
const corsHeaders = (env: Env, reqOrigin: string | null): HeadersInit => {
  const allowed = env.ALLOWED_ORIGIN.split(',').map((s) => s.trim());
  const match = reqOrigin && allowed.includes(reqOrigin) ? reqOrigin : allowed[0];
  return {
    'Access-Control-Allow-Origin': match,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

const parseUA = (ua: string) => {
  const browser =
    /Firefox\/\d/.test(ua) ? 'Firefox'
    : /Edg\/\d/.test(ua)   ? 'Edge'
    : /OPR\/\d/.test(ua)   ? 'Opera'
    : /Chrome\/\d/.test(ua) ? 'Chrome'
    : /Safari\/\d/.test(ua) ? 'Safari'
    : 'Other';
  const os =
    /Mac OS X/.test(ua)  ? 'macOS'
    : /Windows NT/.test(ua) ? 'Windows'
    : /Android/.test(ua)  ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Other';
  const device = /Mobile|Android|iPhone|iPad|iPod/.test(ua) ? 'mobile' : 'desktop';
  return { browser, os, device };
};

const truncate = (s: string | null | undefined, n: number): string | null => {
  if (!s) return null;
  return s.length > n ? s.slice(0, n) : s;
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(env, req.headers.get('Origin'));

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // --- POST /hit -----------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/hit') {
      let body: any = {};
      try { body = await req.json(); } catch { /* empty body OK */ }

      const cf: any = (req as any).cf ?? {};
      // Skip Cloudflare-flagged bots so the numbers stay honest.
      if (cf.bot === true) {
        return new Response(null, { status: 204, headers: cors });
      }

      const ua = req.headers.get('user-agent') ?? '';
      const { browser, os, device } = parseUA(ua);

      try {
        await env.DB.prepare(
          `INSERT INTO hits
             (ts, campaign, session_id, country, city, region, browser, os, device, referrer)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          Date.now(),
          truncate(body.campaign ?? null, 64),
          truncate(body.session_id ?? null, 64),
          cf.country ?? null,
          cf.city ?? null,
          cf.region ?? null,
          browser,
          os,
          device,
          truncate(body.referrer ?? null, 256),
        ).run();
      } catch (e) {
        return new Response(`db error: ${e}`, { status: 500, headers: cors });
      }

      return new Response(null, { status: 204, headers: cors });
    }

    // --- GET /stats?key=... --------------------------------------------
    if (req.method === 'GET' && url.pathname === '/stats') {
      const key = url.searchParams.get('key');
      if (!key || key !== env.ADMIN_TOKEN) {
        return new Response('unauthorized', { status: 401, headers: cors });
      }

      const [totalsRes, byCampaign, byCountry, byBrowser, byOs, byReferrer, recent] = await Promise.all([
        env.DB.prepare(
          `SELECT COUNT(*) AS total, COUNT(DISTINCT session_id) AS uniques FROM hits`
        ).first(),
        env.DB.prepare(
          `SELECT COALESCE(campaign, '(no campaign)') AS campaign,
                  COUNT(*) AS hits,
                  COUNT(DISTINCT session_id) AS uniques,
                  MIN(ts) AS first_seen,
                  MAX(ts) AS last_seen
           FROM hits GROUP BY campaign ORDER BY hits DESC`
        ).all(),
        env.DB.prepare(
          `SELECT country, COUNT(*) AS n FROM hits
           WHERE country IS NOT NULL
           GROUP BY country ORDER BY n DESC LIMIT 25`
        ).all(),
        env.DB.prepare(
          `SELECT browser, COUNT(*) AS n FROM hits
           GROUP BY browser ORDER BY n DESC`
        ).all(),
        env.DB.prepare(
          `SELECT os, COUNT(*) AS n FROM hits
           GROUP BY os ORDER BY n DESC`
        ).all(),
        env.DB.prepare(
          `SELECT referrer, COUNT(*) AS n FROM hits
           WHERE referrer IS NOT NULL AND referrer <> ''
           GROUP BY referrer ORDER BY n DESC LIMIT 15`
        ).all(),
        env.DB.prepare(
          `SELECT ts, campaign, country, city, browser, os, device, referrer
           FROM hits ORDER BY ts DESC LIMIT 40`
        ).all(),
      ]);

      return Response.json({
        totals: totalsRes ?? { total: 0, uniques: 0 },
        by_campaign: byCampaign.results,
        by_country: byCountry.results,
        by_browser: byBrowser.results,
        by_os: byOs.results,
        by_referrer: byReferrer.results,
        recent: recent.results,
      }, { headers: cors });
    }

    return new Response('not found', { status: 404, headers: cors });
  },
};
