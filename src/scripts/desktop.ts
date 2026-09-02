// Window manager: open/close, focus (z-index), drag by titlebar,
// traffic-light actions, dock/icon click routing.

let zTop = 100;
const openWindows = new Set<string>();

// --- Sound: synthesized "open" chirp (no audio files needed) ---
let audioCtx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (audioCtx) return audioCtx;
  const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
};

const playOpenSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  // Two short square-wave blips: A5 then E6 — Gameboy-ish "menu open" chirp.
  const notes: Array<[number, number]> = [
    [880, 0.00],
    [1320, 0.05],
  ];
  for (const [freq, offset] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.06, now + offset + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.08);
  }
};

const bringToFront = (win: HTMLElement) => {
  zTop += 1;
  win.style.zIndex = String(zTop);
};

// Center the window in the viewport based on its declared width/height,
// keeping the menu bar (28px) clear. Skip if the window has been maximized.
const centerWindow = (win: HTMLElement) => {
  if (win.dataset.maximized === 'true') return;
  const w = parseFloat(win.style.width) || win.offsetWidth || 640;
  const h = parseFloat(win.style.height) || win.offsetHeight || 440;
  const menuBar = 28;
  const dockGap = 90;
  const availH = Math.max(0, window.innerHeight - menuBar - dockGap);
  const left = Math.max(8, (window.innerWidth - w) / 2);
  const top = Math.max(menuBar + 8, menuBar + (availH - h) / 2);
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
};

// Pick a random on-screen position each time a window is opened fresh.
const randomizeWindow = (win: HTMLElement) => {
  if (win.dataset.maximized === 'true') return;
  const w = parseFloat(win.style.width) || win.offsetWidth || 640;
  const h = parseFloat(win.style.height) || win.offsetHeight || 440;
  const menuBar = 28;
  const dockGap = 90;
  const sidePad = 12;
  const minLeft = sidePad;
  const maxLeft = window.innerWidth - w - sidePad;
  const minTop = menuBar + sidePad;
  const maxTop = window.innerHeight - dockGap - h;
  const left = maxLeft < minLeft ? sidePad : Math.floor(minLeft + Math.random() * (maxLeft - minLeft + 1));
  const top = maxTop < minTop ? minTop : Math.floor(minTop + Math.random() * (maxTop - minTop + 1));
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
};

const openWindow = (id: string, sourceEl?: HTMLElement) => {
  const win = document.getElementById(`dw-window-${id}`) as HTMLElement | null;
  if (!win) return;
  const wasOpen = win.classList.contains('is-open');

  // Only reposition on a fresh open — don't yank a window a user is already
  // looking at just because they clicked its dock icon again.
  if (!wasOpen) {
    if (id === 'readme') centerWindow(win);
    else randomizeWindow(win);
  }

  win.classList.remove('is-minimizing');
  win.classList.add('is-open');
  bringToFront(win);
  openWindows.add(id);

  if (!wasOpen) playOpenSound();

  if (sourceEl) {
    sourceEl.classList.add('is-bouncing');
    setTimeout(() => sourceEl.classList.remove('is-bouncing'), 500);
  }
};

const closeWindow = (id: string) => {
  const win = document.getElementById(`dw-window-${id}`);
  if (!win) return;
  win.classList.remove('is-open');
  openWindows.delete(id);
};

const minimizeWindow = (id: string) => {
  const win = document.getElementById(`dw-window-${id}`);
  if (!win) return;
  win.classList.add('is-minimizing');
  setTimeout(() => {
    win.classList.remove('is-open', 'is-minimizing');
    openWindows.delete(id);
  }, 240);
};

const maximizeWindow = (id: string) => {
  const win = document.getElementById(`dw-window-${id}`) as HTMLElement | null;
  if (!win) return;
  const isMax = win.dataset.maximized === 'true';
  if (isMax) {
    win.style.left = win.dataset.prevLeft || '120px';
    win.style.top = win.dataset.prevTop || '80px';
    win.style.width = win.dataset.prevWidth || '640px';
    win.style.height = win.dataset.prevHeight || '440px';
    win.dataset.maximized = 'false';
  } else {
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.style.left = '16px';
    win.style.top = '40px';
    win.style.width = 'calc(100vw - 32px)';
    win.style.height = 'calc(100vh - 100px)';
    win.dataset.maximized = 'true';
  }
};

// --- Drag ---
const makeDraggable = (win: HTMLElement) => {
  const handle = win.querySelector<HTMLElement>('[data-drag-handle]');
  if (!handle) return;
  let startX = 0, startY = 0, origX = 0, origY = 0, dragging = false;

  handle.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.dw-tl')) return; // ignore traffic-light clicks
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origX = win.offsetLeft;
    origY = win.offsetTop;
    handle.setPointerCapture(e.pointerId);
    bringToFront(win);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const nx = origX + (e.clientX - startX);
    const ny = Math.max(28, origY + (e.clientY - startY)); // don't hide under menu bar
    win.style.left = `${nx}px`;
    win.style.top = `${ny}px`;
  });
  const end = (e: PointerEvent) => {
    dragging = false;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
};

// --- Wire everything on load ---
const init = () => {
  document.querySelectorAll<HTMLElement>('.dw-window').forEach((win) => {
    makeDraggable(win);
    // Click anywhere in window brings it to front
    win.addEventListener('pointerdown', () => bringToFront(win), true);

    // Auto-open windows that ship with is-open
    if (win.classList.contains('is-open')) {
      const id = win.dataset.windowId;
      if (id) openWindows.add(id);
      centerWindow(win);
      bringToFront(win);
    }

    // Traffic light actions
    win.querySelectorAll<HTMLButtonElement>('[data-window-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = win.dataset.windowId;
        if (!id) return;
        const action = btn.dataset.windowAction;
        if (action === 'close') closeWindow(id);
        else if (action === 'minimize') minimizeWindow(id);
        else if (action === 'maximize') maximizeWindow(id);
      });
    });
  });

  // Icons & dock items with data-window / data-href
  document.querySelectorAll<HTMLElement>('[data-window], [data-href]').forEach((el) => {
    // Skip windows themselves (they have data-window-id, not data-window)
    if (el.classList.contains('dw-window')) return;

    el.addEventListener('click', (e) => {
      // If this element is an anchor with href="#", it would jump to top —
      // prevent that. Real external hrefs are opened programmatically below.
      if (el.tagName === 'A') e.preventDefault();
      const href = el.dataset.href;
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
      const winId = el.dataset.window;
      if (winId) openWindow(winId, el);
    });
  });

  // Desktop icon selection (single click selects, second click opens)
  const icons = document.querySelectorAll<HTMLElement>('.dw-icon');
  icons.forEach((icon) => {
    icon.addEventListener('pointerdown', (e) => {
      icons.forEach((i) => i.classList.remove('is-selected'));
      icon.classList.add('is-selected');
      e.stopPropagation();
    });
  });
  // Click empty desktop = deselect
  document.addEventListener('pointerdown', () => {
    icons.forEach((i) => i.classList.remove('is-selected'));
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
