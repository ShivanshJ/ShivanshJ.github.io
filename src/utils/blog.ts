// Shared helpers for blog post metadata — used by BlogWindow and the static
// article pages so reading-time and date logic stays in one place.

const WORDS_PER_MINUTE = 220;

/** Returns estimated reading time in minutes (minimum 1). */
export const readingTime = (raw: string): number =>
  Math.max(1, Math.round(raw.trim().split(/\s+/).length / WORDS_PER_MINUTE));

/** Formats an ISO date string. Defaults to short month ("Jan 15, 2020"). */
export const fmtDate = (
  iso: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', opts);
  } catch {
    return iso;
  }
};
