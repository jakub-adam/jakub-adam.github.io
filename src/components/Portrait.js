import { html, useEffect, useRef } from '../lib/html.js';
import { reduceMotion } from '../lib/motion.js';
import { site } from '../data/site.js';

/* Your photo on the home page (images/profile.jpg), drawn as a dot-matrix halftone:
   the photo is reduced to a small grid and every cell becomes one dot. In the light theme
   dark parts of the photo get big dark dots, in the dark theme bright parts get big light dots,
   so it reads as the same picture either way. Dots near the cursor swell and lean away from it.
   Until a photo exists it draws a plain head-and-shoulders shape instead.
   Tweak COLS and ROWS for a finer or coarser grid. */
const COLS = 25, ROWS = 31;
const REACH = 3.2;   // how far the cursor works, in dots
const SWELL = 0.55;  // how much a dot under the cursor grows
const EASE = 0.16;

/* A head and shoulders, used when there is no photo: returns how dark each cell is (0 to 1) */
function silhouette() {
  const cells = new Float32Array(COLS * ROWS);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const u = (x + 0.5) / COLS - 0.5, v = (y + 0.5) / ROWS;
    const head = 1 - Math.hypot(u / 0.2, (v - 0.36) / 0.2);
    const body = 1 - Math.hypot(u / 0.46, (v - 1.08) / 0.42);
    cells[y * COLS + x] = Math.max(0, Math.min(1, Math.max(head, body) * 3.2));
  }
  return cells;
}

/* Shrinks the photo to the grid (cropped from the upper part, so faces stay in frame) and stretches the contrast */
function fromImage(img) {
  const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true });
  c.width = COLS; c.height = ROWS;
  const scale = Math.max(COLS / img.naturalWidth, ROWS / img.naturalHeight);
  const sw = COLS / scale, sh = ROWS / scale;
  g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) * 0.25, sw, sh, 0, 0, COLS, ROWS);
  const px = g.getImageData(0, 0, COLS, ROWS).data, cells = new Float32Array(COLS * ROWS);
  let lo = 1, hi = 0;
  for (let i = 0; i < cells.length; i++) {
    const l = (px[i * 4] * 0.2126 + px[i * 4 + 1] * 0.7152 + px[i * 4 + 2] * 0.0722) / 255;
    cells[i] = 1 - l; lo = Math.min(lo, cells[i]); hi = Math.max(hi, cells[i]);
  }
  for (let i = 0; i < cells.length; i++) cells[i] = hi - lo > 0.05 ? (cells[i] - lo) / (hi - lo) : cells[i];
  return cells;
}

export function Portrait() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current, g = canvas.getContext('2d');
    let dark = silhouette(), w = 0, h = 0, raf = 0, born = performance.now();
    const grow = new Float32Array(COLS * ROWS);          // how much each dot is currently swollen, 0 to 1
    const pointer = { x: -99, y: -99, on: false };

    const draw = () => {
      raf = 0;
      const cell = w / COLS, night = document.documentElement.getAttribute('data-theme') === 'dark';
      const age = reduceMotion ? 9 : (performance.now() - born) / 1000;
      let moving = age < 1.6;
      g.clearRect(0, 0, w, h);
      g.fillStyle = getComputedStyle(canvas).color;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x, cx = (x + 0.5) * cell, cy = (y + 0.5) * cell;
        const dist = Math.hypot(cx - pointer.x, cy - pointer.y) / cell;
        const goal = pointer.on ? Math.max(0, 1 - dist / REACH) : 0;
        grow[i] += (goal - grow[i]) * (reduceMotion ? 1 : EASE);
        if (Math.abs(goal - grow[i]) > 0.01) moving = true;
        const tone = Math.max(0.035, night ? 1 - dark[i] : dark[i]);
        const arrive = Math.max(0, Math.min(1, age * 2.2 - (x + y) / (COLS + ROWS) * 1.8));   // dots appear in a diagonal sweep
        const r = cell * 0.46 * Math.sqrt(tone) * (1 + grow[i] * SWELL) * arrive * (2 - arrive);
        const push = grow[i] * cell * 0.35, away = Math.atan2(cy - pointer.y, cx - pointer.x);
        g.globalAlpha = 0.35 + 0.65 * tone;
        g.beginPath(); g.arc(cx + Math.cos(away) * push, cy + Math.sin(away) * push, Math.min(r, cell * 0.62), 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      if (moving) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const resize = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      kick();
    };
    const move = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true; kick(); };
    const leave = () => { pointer.on = false; kick(); };

    const img = new Image();
    img.onload = () => { try { dark = fromImage(img); born = performance.now(); kick(); } catch (e) {} };
    img.src = site.photo;

    const sizeWatch = new ResizeObserver(resize);
    const themeWatch = new MutationObserver(kick);
    sizeWatch.observe(canvas);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    resize();
    return () => { cancelAnimationFrame(raf); sizeWatch.disconnect(); themeWatch.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); };
  }, []);

  return html`
    <figure class="portrait">
      <div class="portrait-frame"><canvas ref=${ref} role="img" aria-label=${'Portrait of ' + site.name + ', drawn as a grid of dots'}></canvas></div>
      <figcaption><span>Fig. 01</span><span>Portrait · ${COLS} × ${ROWS} dots</span></figcaption>
    </figure>`;
}
