-- Apply once with:
--   wrangler d1 execute portfolio-hits --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS hits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,      -- ms epoch
  campaign     TEXT,                  -- from ?cmp= param
  session_id   TEXT,                  -- stable per-browser UUID (localStorage)
  country      TEXT,                  -- from Cloudflare edge
  city         TEXT,
  region       TEXT,
  browser      TEXT,                  -- Chrome / Safari / Firefox / Edge / Other
  os           TEXT,                  -- macOS / Windows / iOS / Android / Linux / Other
  device       TEXT,                  -- mobile / desktop
  referrer     TEXT
);

CREATE INDEX IF NOT EXISTS idx_hits_campaign ON hits(campaign);
CREATE INDEX IF NOT EXISTS idx_hits_ts       ON hits(ts);
CREATE INDEX IF NOT EXISTS idx_hits_session  ON hits(session_id);
