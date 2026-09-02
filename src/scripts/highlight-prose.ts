// Auto-wrap wins inside .dw-prose bullets so the eye lands on the numbers.
// Matches things like: $4.6M, $610k, 32%, 3–4×, 180 TPS, 5 engineers.
// Applied once at load; only touches text nodes, never HTML.

const PATTERNS: RegExp[] = [
  /\$\d[\d.,]*[kKmMbB]?/g,                 // $4.6M, $610k, $80k
  /\d[\d.,]*\s*[×x]/g,                     // 3×, 3–4×, 2x
  /\d[\d.,]*[–-]\d[\d.,]*%/g,              // 35–45%
  /\+?\d[\d.,]*%/g,                        // 32%, +32%
  /\b\d[\d,]{2,}\b/g,                      // 4600, 12,000
  /\b\d+\s*(TPS|RPS|QPS|ms|s|k|K|M|B)\b/g, // 180 TPS, 500ms
  /\b\d+\s*(engineers?|people|users?|models?)\b/gi,  // 5 engineers, 30 users
];

const highlightTextNode = (node: Text) => {
  const original = node.nodeValue ?? '';
  if (!original.trim()) return;

  // Collect all match ranges from every pattern
  type Range = { start: number; end: number };
  const ranges: Range[] = [];
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(original))) {
      ranges.push({ start: m.index, end: m.index + m[0].length });
    }
  }
  if (ranges.length === 0) return;

  // Merge overlapping ranges, sort by start
  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [];
  for (const r of ranges) {
    const prev = merged[merged.length - 1];
    if (prev && r.start <= prev.end) prev.end = Math.max(prev.end, r.end);
    else merged.push({ ...r });
  }

  // Build a fragment with <span class="dw-hl"> around each range
  const frag = document.createDocumentFragment();
  let cursor = 0;
  for (const r of merged) {
    if (r.start > cursor) frag.appendChild(document.createTextNode(original.slice(cursor, r.start)));
    const span = document.createElement('span');
    span.className = 'dw-hl';
    span.textContent = original.slice(r.start, r.end);
    frag.appendChild(span);
    cursor = r.end;
  }
  if (cursor < original.length) frag.appendChild(document.createTextNode(original.slice(cursor)));

  node.parentNode?.replaceChild(frag, node);
};

const walk = (root: Node) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      // Skip text already inside a .dw-hl, or inside <code>/<a>/<strong>
      const parent = n.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.dw-hl, code, a, strong')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const texts: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) texts.push(n as Text);
  texts.forEach(highlightTextNode);
};

const init = () => {
  document.querySelectorAll('.dw-prose').forEach(walk);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
