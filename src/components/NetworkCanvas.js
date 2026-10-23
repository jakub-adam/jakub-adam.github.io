import { html, useEffect, useRef } from '../lib/html.js';
import { reduceMotion } from '../lib/motion.js';

/* The sky in the left panel, drawn on a <canvas>. It follows the theme:
   light theme = daytime, dark theme = night. Switching the theme plays a sunset or a sunrise.

   Night
   - stars in three layers: far ones are small and slow, near ones bigger and faster
   - the sky drifts on a slow current that swings direction, so it flows instead of sliding
   - each star twinkles at its own pace, a moon hangs in the corner
   - shooting stars now and then; click anywhere to send one
   - the cursor links the stars closest to it, like drawing a constellation

   Day
   - a sun, and clouds drifting on the wind at different heights and speeds
   - the cursor gently pushes clouds out of the way
   - click a cloud and it rains for a moment
   - a small flock of birds flies past now and then

   Tweak the numbers below to change the feel. */
const DENSITY = 2000;                  // one star per this many square pixels
const MAX_STARS = 420;
const FLOW = 9;                        // star drift speed of the nearest layer, in pixels per second
const LAYERS = [                       // share of the stars, size range, speed factor, brightness
  { share: 0.6, size: [0.3, 0.8], speed: 0.25, light: 0.55 },
  { share: 0.3, size: [0.7, 1.3], speed: 0.55, light: 0.8 },
  { share: 0.1, size: [1.2, 2.0], speed: 1, light: 1 },
];
const TINTS = ['255,255,255', '255,255,255', '255,255,255', '205,222,255', '255,236,212'];
const NIGHT = { top: [0, 0, 0], bottom: [4, 8, 20] };
const DAY = { top: [46, 120, 210], bottom: [150, 206, 242] };
const CLOUD_AREA = 70000;              // one cloud per this many square pixels
const SHOOTING_EVERY = [5000, 14000];  // milliseconds between shooting stars
const BIRDS_EVERY = [7000, 16000];     // milliseconds between flocks of birds
const LINK = 120;                      // how far the cursor reaches to link stars, in pixels
const TILT = 24;                       // how far the near layer moves with the cursor, in pixels
const SUNSET = 1.8;                    // how fast day turns to night and back (higher = faster)

const rand = (a, b) => a + Math.random() * (b - a);
const mix = (a, b, t) => a + (b - a) * t;
const mixColor = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t))).join(',');
const smooth = t => t * t * (3 - 2 * t);
const isDay = () => document.documentElement.getAttribute('data-theme') !== 'dark';

const pickLayer = () => {
  let r = Math.random();
  for (const layer of LAYERS) {
    r -= layer.share;
    if (r <= 0) return layer;
  }
  return LAYERS[0];
};

export function NetworkCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current, g = canvas.getContext('2d'), box = canvas.parentElement;
    // Clouds are drawn on their own layer first, so they fade in and out as whole shapes
    const cloudLayer = document.createElement('canvas'), cg = cloudLayer.getContext('2d');
    let w = 0, h = 0, time = 0, raf = 0, last = 0, visible = true;
    let stars = [], clouds = [], drops = [], birds = [], shot = null;
    let nextShot = rand(...SHOOTING_EVERY), nextBirds = rand(2000, 6000);
    let day = isDay() ? 1 : 0, dayGoal = day;          // 1 = full day, 0 = full night
    const pointer = { x: 0, y: 0, on: false };
    const tilt = { x: 0, y: 0 };

    /* ---------- making things ---------- */
    const makeStar = () => {
      const layer = pickLayer();
      return {
        x: Math.random() * w, y: Math.random() * h, layer,
        r: rand(...layer.size),
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
        phase: Math.random() * Math.PI * 2,
        pace: rand(0.5, 2),
      };
    };

    // A cloud is a row of overlapping circles ("puffs"), biggest in the middle
    const makeCloud = anywhere => {
      const size = rand(0.6, 1.3), count = 5 + Math.floor(Math.random() * 3), middle = (count - 1) / 2;
      const puffs = Array.from({ length: count }, (_, i) => ({
        dx: (i - middle) * 20 * size + rand(-4, 4),
        dy: -Math.max(0, 1 - Math.abs(i - middle) / (middle + 1)) * 14 * size + rand(-3, 3),
        r: (26 - Math.abs(i - middle) * 4) * size + rand(0, 5),
      }));
      const half = middle * 20 * size + 30 * size;
      const y = rand(0.08, 0.62) * h;
      return {
        x: anywhere ? Math.random() * w : -half - 10, y, homeY: y, half, puffs,
        speed: 6 + 14 * size,           // bigger clouds look closer, so they move faster
        push: { x: 0, y: 0 }, wobble: 0, rain: 0,
      };
    };

    const launchShootingStar = (x, y) => {
      const goingRight = x === undefined ? Math.random() < 0.5 : x < w / 2;
      const angle = rand(0.3, 0.7) * (goingRight ? 1 : -1) + (goingRight ? 0 : Math.PI);
      shot = {
        x: x ?? rand(0.15, 0.85) * w, y: y ?? rand(0, 0.45) * h,
        angle, speed: rand(600, 900), age: 0, life: rand(700, 1100),
      };
    };

    const launchBirds = () => {
      const y = rand(0.1, 0.4) * h, count = 2 + Math.floor(Math.random() * 3), speed = rand(45, 70);
      for (let i = 0; i < count; i++) {
        birds.push({ x: -20 - i * 18, y: y + (i % 2 ? 10 : -6) * Math.ceil(i / 2), speed, flap: Math.random() * 6, size: rand(4, 6) });
      }
    };

    const build = () => {
      const rect = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), oldW = w, oldH = h;
      w = rect.width; h = rect.height;
      canvas.width = cloudLayer.width = Math.round(w * dpr);
      canvas.height = cloudLayer.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      cg.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (oldW && oldH) {                                   // keep the same sky, just rescale it
        stars.forEach(s => { s.x *= w / oldW; s.y *= h / oldH; });
        clouds.forEach(c => { c.x *= w / oldW; c.y *= h / oldH; c.homeY *= h / oldH; });
      }
      const wantStars = Math.min(MAX_STARS, Math.round((w * h) / DENSITY));
      while (stars.length > wantStars) stars.pop();
      while (stars.length < wantStars) stars.push(makeStar());
      const wantClouds = Math.max(3, Math.min(9, Math.round((w * h) / CLOUD_AREA)));
      while (clouds.length > wantClouds) clouds.pop();
      while (clouds.length < wantClouds) clouds.push(makeCloud(true));
      draw(0);
    };

    /* ---------- drawing ---------- */
    const drawBackground = () => {
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, `rgb(${mixColor(NIGHT.top, DAY.top, day)})`);
      sky.addColorStop(1, `rgb(${mixColor(NIGHT.bottom, DAY.bottom, day)})`);
      g.fillStyle = sky;
      g.fillRect(0, 0, w, h);
    };

    // The sun sinks below the bottom edge as night falls, and the moon rises as it does
    const drawSunAndMoon = () => {
      const up = smooth(day), x = w * 0.74 + tilt.x * 0.3;
      if (day > 0.01) {
        const y = mix(h * 1.15, h * 0.2, up) + tilt.y * 0.3, glow = g.createRadialGradient(x, y, 0, x, y, 110);
        glow.addColorStop(0, `rgba(255,246,210,${0.75 * day})`);
        glow.addColorStop(1, 'rgba(255,246,210,0)');
        g.fillStyle = glow; g.beginPath(); g.arc(x, y, 110, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(255,250,228,${day})`; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill();
      }
      if (day < 0.99) {
        const y = mix(h * 0.17, h * 1.15, up) + tilt.y * 0.3, fade = 1 - day;
        const glow = g.createRadialGradient(x, y, 0, x, y, 70);
        glow.addColorStop(0, `rgba(210,225,255,${0.25 * fade})`);
        glow.addColorStop(1, 'rgba(210,225,255,0)');
        g.fillStyle = glow; g.beginPath(); g.arc(x, y, 70, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(238,240,232,${fade})`; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(190,195,200,${0.5 * fade})`;     // a few craters
        [[-6, -4, 4], [5, 3, 3], [-2, 8, 2.5]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); });
      }
    };

    const drawStars = (sec, flowX, flowY) => {
      const night = 1 - day, near = [];
      for (const s of stars) {
        const speed = s.layer.speed;
        s.x += (flowX + Math.sin(s.y * 0.012 + time * 0.0003) * 3) * speed * sec;
        s.y += (flowY + Math.cos(s.x * 0.012 + time * 0.00025) * 3) * speed * sec;
        if (s.x < -10) s.x += w + 20; else if (s.x > w + 10) s.x -= w + 20;     // wrap around the edges
        if (s.y < -10) s.y += h + 20; else if (s.y > h + 10) s.y -= h + 20;
        if (night < 0.01) continue;

        const x = s.x + tilt.x * speed, y = s.y + tilt.y * speed;
        const shine = night * s.layer.light * (0.65 + 0.35 * Math.sin(s.phase + time * 0.001 * s.pace));
        if (s.r > 1.1) {                                     // soft glow around the brighter stars
          g.fillStyle = `rgba(${s.tint},${(shine * 0.12).toFixed(3)})`;
          g.beginPath(); g.arc(x, y, s.r * 3.5, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = `rgba(${s.tint},${shine.toFixed(3)})`;
        g.beginPath(); g.arc(x, y, s.r, 0, Math.PI * 2); g.fill();

        if (pointer.on && s.layer !== LAYERS[0]) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          if (d < LINK) near.push({ x, y, d });
        }
      }
      // Faint lines from the cursor to the closest stars
      near.sort((a, b) => a.d - b.d).slice(0, 5).forEach(p => {
        g.strokeStyle = `rgba(255,255,255,${(0.35 * night * (1 - p.d / LINK)).toFixed(3)})`;
        g.beginPath(); g.moveTo(pointer.x, pointer.y); g.lineTo(p.x, p.y); g.stroke();
      });
    };

    const drawShootingStar = sec => {
      if (!shot) return;
      shot.age += sec * 1000;
      shot.x += Math.cos(shot.angle) * shot.speed * sec;
      shot.y += Math.sin(shot.angle) * shot.speed * sec;
      const fade = Math.sin(Math.PI * Math.min(1, shot.age / shot.life)) * (1 - day);
      const tailX = shot.x - Math.cos(shot.angle) * 140, tailY = shot.y - Math.sin(shot.angle) * 140;
      const tail = g.createLinearGradient(tailX, tailY, shot.x, shot.y);
      tail.addColorStop(0, 'rgba(255,255,255,0)');
      tail.addColorStop(1, `rgba(255,255,255,${(0.9 * fade).toFixed(3)})`);
      g.strokeStyle = tail; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(tailX, tailY); g.lineTo(shot.x, shot.y); g.stroke();
      g.lineWidth = 1;
      if (shot.age >= shot.life) { shot = null; nextShot = rand(...SHOOTING_EVERY); }
    };

    const drawClouds = sec => {
      let hovering = false;
      cg.clearRect(0, 0, w, h);
      for (const c of clouds) {
        // the wind, plus whatever push the cursor gave it, which slowly fades
        c.x += (c.speed + c.push.x) * sec;
        c.y += c.push.y * sec + (c.homeY - c.y) * Math.min(1, sec * 0.4);
        const calm = Math.pow(0.2, sec);
        c.push.x *= calm; c.push.y *= calm;
        if (c.x - c.half > w + 10) Object.assign(c, makeCloud(false));

        if (pointer.on && day > 0.5) {
          const dx = c.x - pointer.x, dy = c.y - pointer.y, d = Math.hypot(dx, dy) || 1, reach = c.half + 50;
          if (d < reach) {
            const force = (1 - d / reach) * 260 * sec;
            c.push.x += (dx / d) * force; c.push.y += (dy / d) * force;
          }
          if (d < c.half) hovering = true;
        }

        if (c.rain > 0) {                                    // a clicked cloud rains for a moment
          c.rain -= sec;
          const count = Math.random() < 50 * sec ? 1 + Math.floor(Math.random() * 2) : 0;
          for (let i = 0; i < count; i++) drops.push({ x: c.x + rand(-c.half * 0.7, c.half * 0.7), y: c.y + 12, speed: rand(260, 360) });
        }
        c.wobble = Math.max(0, c.wobble - sec * 1.2);
        if (day < 0.01) continue;

        const squash = 1 + 0.08 * Math.sin(c.wobble * 22) * c.wobble;
        cg.fillStyle = '#c4d6ec';                            // soft shadow under each puff
        c.puffs.forEach(p => { cg.beginPath(); cg.arc(c.x + p.dx * squash, c.y + p.dy / squash + p.r * 0.28, p.r * squash, 0, Math.PI * 2); cg.fill(); });
        cg.fillStyle = '#fff';
        c.puffs.forEach(p => { cg.beginPath(); cg.arc(c.x + p.dx * squash, c.y + p.dy / squash, p.r * squash, 0, Math.PI * 2); cg.fill(); });
      }
      if (day > 0.01) {
        g.globalAlpha = 0.95 * day;
        g.drawImage(cloudLayer, 0, 0, w, h);
        g.globalAlpha = 1;
      }
      box.style.cursor = hovering ? 'pointer' : '';
    };

    const drawRain = sec => {
      g.strokeStyle = `rgba(70,120,190,${0.6 * day})`;
      g.beginPath();
      drops = drops.filter(d => {
        d.y += d.speed * sec;
        g.moveTo(d.x, d.y); g.lineTo(d.x - 1, d.y + 7);
        return d.y < h;
      });
      g.stroke();
    };

    const drawBirds = sec => {
      g.strokeStyle = `rgba(20,40,70,${0.55 * day})`;
      g.lineWidth = 1.5;
      birds = birds.filter(b => {
        b.x += b.speed * sec;
        b.flap += sec * 9;
        const wing = Math.sin(b.flap) * b.size * 0.7;
        g.beginPath();
        g.moveTo(b.x - b.size, b.y - wing); g.quadraticCurveTo(b.x - b.size * 0.4, b.y - wing * 0.2, b.x, b.y);
        g.quadraticCurveTo(b.x + b.size * 0.4, b.y - wing * 0.2, b.x + b.size, b.y - wing);
        g.stroke();
        return b.x < w + 30;
      });
      g.lineWidth = 1;
    };

    const draw = dt => {                                     // dt in milliseconds
      time += dt;
      const sec = dt / 1000;

      // Day and night blend into each other instead of switching at once
      day = reduceMotion ? dayGoal : day + (dayGoal - day) * Math.min(1, sec * SUNSET);
      if (Math.abs(day - dayGoal) < 0.002) day = dayGoal;

      // The star current: a direction that slowly swings back and forth
      const heading = -0.45 + 0.6 * Math.sin(time * 0.00003);
      const flowX = Math.cos(heading) * FLOW, flowY = Math.sin(heading) * FLOW;

      // Ease the parallax toward the cursor (or back to the middle when it leaves)
      const ease = Math.min(1, sec * 2.5);
      tilt.x += ((pointer.on ? (0.5 - pointer.x / w) * TILT : 0) - tilt.x) * ease;
      tilt.y += ((pointer.on ? (0.5 - pointer.y / h) * TILT : 0) - tilt.y) * ease;

      drawBackground();
      drawSunAndMoon();
      drawStars(sec, flowX, flowY);
      drawShootingStar(sec);
      drawClouds(sec);
      drawRain(sec);
      drawBirds(sec);

      nextShot -= dt;
      if (!shot && nextShot <= 0 && dt > 0 && day < 0.3) launchShootingStar();
      nextBirds -= dt;
      if (nextBirds <= 0 && dt > 0) { if (day > 0.7) launchBirds(); nextBirds = rand(...BIRDS_EVERY); }
    };

    /* ---------- running and listening ---------- */
    const loop = now => {
      const dt = Math.min(60, now - last || 16);
      last = now;
      draw(dt);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => { if (!raf && !reduceMotion) { last = 0; raf = requestAnimationFrame(loop); } };

    const where = e => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const move = e => { Object.assign(pointer, where(e), { on: true }); };
    const leave = () => { pointer.on = false; box.style.cursor = ''; };
    const click = e => {
      const p = where(e);
      if (day > 0.5) {
        const hit = clouds.find(c => Math.hypot(c.x - p.x, c.y - p.y) < c.half);
        if (hit) { hit.wobble = 1; hit.rain = 1.6; }
      } else {
        launchShootingStar(p.x, p.y);
      }
    };
    const resize = new ResizeObserver(build);
    const watch = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); });
    const theme = new MutationObserver(() => { dayGoal = isDay() ? 1 : 0; if (reduceMotion) draw(0); });
    const onVisibility = () => !document.hidden && start();

    build(); start();
    resize.observe(box); watch.observe(canvas);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    box.addEventListener('pointermove', move); box.addEventListener('pointerleave', leave);
    box.addEventListener('pointerdown', click);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf); resize.disconnect(); watch.disconnect(); theme.disconnect();
      box.removeEventListener('pointermove', move); box.removeEventListener('pointerleave', leave);
      box.removeEventListener('pointerdown', click);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return html`<canvas class="net" ref=${ref} aria-hidden="true"></canvas>`;
}
