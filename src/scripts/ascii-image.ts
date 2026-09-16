// Loads pre-generated ASCII art for blog images and replaces each <img> with
// a <pre> overlay. ASCII files are produced at build time by
// scripts/ascii-prerender.mjs using ascii-image-converter.
//
// Hover reveals the original photo; the ASCII fades out.
// Targets .blog-prose — the shared class on both render contexts:
//   .dw-blog-prose.blog-prose  (BlogWindow.astro — desktop UI)
//   .article-prose.blog-prose  ([slug].astro — standalone article page)

// Must match the imgSlug() function in scripts/ascii-prerender.mjs.
function imgSlug(src: string): string {
  if (src.startsWith('/')) {
    return src.slice(1).replace(/[/.]/g, '-').replace(/-+$/, '');
  }
  let h = 5381;
  for (let i = 0; i < src.length; i++) {
    h = (Math.imul(31, h) + src.charCodeAt(i)) | 0;
  }
  return 'ext-' + Math.abs(h).toString(36);
}

function fitPre(pre: HTMLPreElement, wrap: HTMLElement): void {
  const wrapWidth = wrap.getBoundingClientRect().width;
  if (!wrapWidth) return;

  // Reset to CSS-inherited base so repeated calls don't compound the scale.
  pre.style.fontSize   = '';
  pre.style.lineHeight = '1';

  // Measure one character at the base font size.
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  probe.textContent = 'X';
  pre.appendChild(probe);
  const charW    = probe.getBoundingClientRect().width || 1;
  pre.removeChild(probe);

  const baseFontSize = parseFloat(getComputedStyle(pre).fontSize) || 16;

  const lines = (pre.textContent ?? '').split('\n');
  const rows = (lines.at(-1) === '' ? lines.length - 1 : lines.length) || 1;
  const cols = Math.max(...lines.map(l => l.length)) || 1;

  // Scale to fill the full container width. With line-height:1, each row is
  // exactly fontSize px tall, so the wrap height follows from the row count.
  const fontSize   = baseFontSize * (wrapWidth / (cols * charW));
  const wrapHeight = rows * fontSize;

  pre.style.fontSize = `${fontSize}px`;
  wrap.style.height  = `${wrapHeight}px`;
}

async function asciiify(img: HTMLImageElement): Promise<void> {
  const src = img.getAttribute('src') ?? '';
  if (!src) return;

  const slug = imgSlug(src);
  const res  = await fetch(`/ascii/${slug}.txt`);
  if (!res.ok) return; // No pre-generated file — skip silently.

  const text   = await res.text();
  const parent = img.closest('p');
  if (!parent) return;

  const revealImg = img.cloneNode() as HTMLImageElement;

  const pre = document.createElement('pre');
  pre.className   = 'ascii-image-pre';
  pre.textContent = text;

  const wrap = document.createElement('div');
  wrap.className = 'ascii-image-wrap';
  wrap.appendChild(revealImg);
  wrap.appendChild(pre);
  parent.replaceWith(wrap);

  // ResizeObserver handles three cases:
  //   1. Immediate layout (article page — wrap is visible right away).
  //   2. BlogWindow — wrap starts inside a hidden pane; fires when pane is shown.
  //   3. Window resize — re-fits on any subsequent size change.
  const ro = new ResizeObserver(() => fitPre(pre, wrap));
  ro.observe(wrap);

  // Re-fit after load for external images whose naturalWidth/Height may be 0.
  revealImg.addEventListener('load', () => fitPre(pre, wrap), { once: true });
}

document
  .querySelectorAll<HTMLImageElement>('.blog-prose p > img')
  .forEach(img => asciiify(img).catch(() => {}));
