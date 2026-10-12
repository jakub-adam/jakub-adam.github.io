import { html, useEffect, useRef } from '../lib/html.js';
import { reduceMotion } from '../lib/motion.js';

/* A slow starfield drawn on a <canvas>.
   - every star drifts on its own wandering path and speed
   - every star fades in, shines, then fades out and is reborn somewhere else
   - nearby stars are joined by faint lines, and small packets travel along them
   - your cursor joins as one more star
   The drawing color is the page text color, so it is white in dark mode and dark in light mode.
   Tweak the numbers below to change the feel. */
const REACH = 0.26;                 // link distance as a fraction of the shorter side
const SPEED = [5, 16];              // drift speed range in pixels per second
const LIFE = [9000, 22000];         // how long a star lives, in milliseconds
const FADE = 0.3;                   // share of its life spent fading in, and again fading out

const rand = ([a, b]) => a + Math.random() * (b - a);
const smooth = t => t * t * (3 - 2 * t);

export function NetworkCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current, g = canvas.getContext('2d'), box = canvas.parentElement;
    let w = 0, h = 0, stars = [], packets = [], edges = [], raf = 0, last = 0, nextPacket = 0, visible = true, rgb = '0,0,0';
    const pointer = { x: 0, y: 0, on: false };

    const readColor = () => { rgb = (getComputedStyle(canvas).color.match(/\d+/g) || [0, 0, 0]).slice(0, 3).join(','); };
    const born = early => ({
      x: Math.random() * w, y: Math.random() * h, angle: Math.random() * 6.283, turn: (Math.random() - .5) * .3,
      speed: rand(SPEED), life: rand(LIFE), age: early ? Math.random() * LIFE[1] : 0,
      size: 0.9 + Math.random() * 1.4, twinkle: Math.random() * 6.283, alpha: 0, deg: 0,
    });
    const build = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), ow = w, oh = h;
      w = r.width; h = r.height;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const want = Math.max(18, Math.min(60, Math.round((w * h) / 14000)));
      if (ow && oh) stars.forEach(s => { s.x *= w / ow; s.y *= h / oh; });     // keep the same sky, just rescale it
      while (stars.length > want) stars.pop();
      while (stars.length < want) { const s = born(true); s.age %= s.life; stars.push(s); }
      packets = [];
      readColor(); draw(0);
    };

    const draw = dt => {                                    // dt in milliseconds
      const sec = dt / 1000, reach = Math.min(w, h) * REACH;
      g.clearRect(0, 0, w, h);
      stars.forEach((s, i) => {
        s.age += dt; s.deg = 0;
        s.turn = Math.max(-.4, Math.min(.4, s.turn + (Math.random() - .5) * .5 * sec));   // the heading itself wanders
        s.angle += s.turn * sec;
        s.x += Math.cos(s.angle) * s.speed * sec; s.y += Math.sin(s.angle) * s.speed * sec;
        s.twinkle += sec * 1.1;
        const edge = Math.min(s.age, s.life - s.age) / (s.life * FADE);   // 0 -> 1 -> 0 over the star's life
        s.alpha = smooth(Math.max(0, Math.min(1, edge)));
        if (s.age >= s.life || s.x < -30 || s.x > w + 30 || s.y < -30 || s.y > h + 30) stars[i] = born(false);
      });
      edges = [];
      for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j], d = Math.hypot(a.x - b.x, a.y - b.y), vis = Math.min(a.alpha, b.alpha);
        if (d > reach || vis < .05) continue;
        a.deg++; b.deg++; if (vis > .5) edges.push([a, b]);
        g.strokeStyle = `rgba(${rgb},${(0.2 * (1 - d / reach) * vis).toFixed(3)})`;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      if (pointer.on) {                                      // the visitor joins as a star
        stars.map(s => [s, Math.hypot(s.x - pointer.x, s.y - pointer.y)]).filter(([s, d]) => d < reach * 1.2 && s.alpha > .2)
          .sort((p, q) => p[1] - q[1]).slice(0, 3).forEach(([s, d]) => {
            g.strokeStyle = `rgba(${rgb},${(0.45 * (1 - d / (reach * 1.2)) * s.alpha).toFixed(3)})`;
            g.beginPath(); g.moveTo(pointer.x, pointer.y); g.lineTo(s.x, s.y); g.stroke();
          });
        g.fillStyle = `rgba(${rgb},.9)`; g.beginPath(); g.arc(pointer.x, pointer.y, 2.2, 0, 7); g.fill();
      }
      stars.forEach(s => {
        const shine = s.alpha * (0.78 + 0.22 * Math.sin(s.twinkle)), r = s.size * (s.deg >= 4 ? 1.6 : 1);
        g.fillStyle = `rgba(${rgb},${(shine * 0.14).toFixed(3)})`; g.beginPath(); g.arc(s.x, s.y, r * 4, 0, 7); g.fill();   // soft glow
        g.fillStyle = `rgba(${rgb},${(shine * 0.85).toFixed(3)})`; g.beginPath(); g.arc(s.x, s.y, r, 0, 7); g.fill();       // core
      });
      packets = packets.filter(p => (p.t += 0.0004 * dt) < 1 && p.a.alpha > .3 && p.b.alpha > .3);
      packets.forEach(p => {
        g.fillStyle = `rgba(${rgb},.9)`; g.beginPath();
        g.arc(p.a.x + (p.b.x - p.a.x) * p.t, p.a.y + (p.b.y - p.a.y) * p.t, 1.9, 0, 7); g.fill();
      });
    };

    const loop = now => {
      const dt = Math.min(60, now - last || 16); last = now;
      nextPacket -= dt;
      if (nextPacket <= 0 && edges.length) {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)];
        packets.push(Math.random() < .5 ? { a, b, t: 0 } : { a: b, b: a, t: 0 });
        nextPacket = 500 + Math.random() * 900;
      }
      draw(dt);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => { if (!raf && !reduceMotion) { last = 0; raf = requestAnimationFrame(loop); } };

    const move = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true; };
    const leave = () => { pointer.on = false; };
    const resize = new ResizeObserver(build);
    const watch = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    const theme = new MutationObserver(() => { readColor(); if (reduceMotion) draw(0); });
    const vis = () => !document.hidden && start();

    build(); start();
    resize.observe(box); watch.observe(canvas);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    box.addEventListener('pointermove', move); box.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', vis);
    return () => {
      cancelAnimationFrame(raf); resize.disconnect(); watch.disconnect(); theme.disconnect();
      box.removeEventListener('pointermove', move); box.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return html`<canvas class="net" ref=${ref} aria-hidden="true"></canvas>`;
}
