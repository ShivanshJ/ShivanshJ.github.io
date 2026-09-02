// Text scramble / decode on hover — the classic Awwwards "bits" effect.
// Every element with [data-scramble] has its text scrambled through a
// charset on pointerenter, then decoded one char at a time back to the
// original. Cheap, no dependencies, plays nicely with focus/keyboard too.

const CHARSET = '!<>-_\\/[]{}—=+*^?#________BITS0101ABCDEF';

interface Scramble {
  el: HTMLElement;
  original: string;
  raf: number;
  frame: number;
  queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
}

const registry = new WeakMap<HTMLElement, Scramble>();

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

const scrambleTo = (el: HTMLElement, newText: string) => {
  let s = registry.get(el);
  if (!s) {
    s = { el, original: el.textContent || '', raf: 0, frame: 0, queue: [] };
    registry.set(el, s);
  }
  cancelAnimationFrame(s.raf);
  const oldText = el.textContent || '';
  const length = Math.max(oldText.length, newText.length);
  s.queue = [];
  for (let i = 0; i < length; i++) {
    const from = oldText[i] || '';
    const to = newText[i] || '';
    const start = rand(0, 12);
    const end = start + rand(6, 18);
    s.queue.push({ from, to, start, end });
  }
  s.frame = 0;

  const tick = () => {
    let output = '';
    let complete = 0;
    for (let i = 0, n = s!.queue.length; i < n; i++) {
      const item = s!.queue[i];
      if (s!.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (s!.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) item.char = randomChar();
        output += `<span class="dw-scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }
    el.innerHTML = output;
    if (complete === s!.queue.length) return;
    s!.frame++;
    s!.raf = requestAnimationFrame(tick);
  };
  tick();
};

const attach = (el: HTMLElement) => {
  const original = el.textContent || '';
  el.setAttribute('data-scramble-original', original);
  registry.set(el, { el, original, raf: 0, frame: 0, queue: [] });

  const enter = () => scrambleTo(el, original);
  el.addEventListener('pointerenter', enter);
  el.addEventListener('focus', enter);
};

const init = () => {
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach(attach);

  // Watch for windows opening — attach to any newly-visible scramble targets
  // inside them (they're always in the DOM, so just handle it once at init).
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
