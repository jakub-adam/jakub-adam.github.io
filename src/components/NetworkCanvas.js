import { html, useEffect, useRef } from '../lib/html.js';
import { reduceMotion } from '../lib/motion.js';
import { site } from '../data/site.js';
import { STARS, FIGURES, FIELD, NAMED, TOUR, siderealTime, altAz, sunNow, sunDay, clock, raText, decText } from '../lib/sky.js';

/* The sky in the left panel, drawn on a <canvas> as a small instrument. It follows the theme:
   dark theme = a star chart, light theme = a sun chart. Switching the theme cross-fades the two.
   Both are computed for the place in src/data/site.js (site.place) and the visitor's clock.

   Night
   - the real northern sky around Polaris, turned to where it is right now (it rotates once a day)
   - constellations as line art, the horizon as a dashed curve, stars below it dimmed
   - the cursor shifts the stars slightly (near ones more) and reads out the star closest to it;
     when nobody is pointing, the readout visits a few bright stars on its own
   - click anywhere for a shooting star

   Day
   - the sun's path for today from sunrise to sunset, a dot for every full hour
   - the sun where it actually is, with its height and compass direction
   - flat clouds drifting on a slow wind

   Tweak the numbers below to change the feel. */
const SCALE = 0.0069;        // star chart zoom: pixels per degree, as a share of the panel height
const CENTRE = [0.56, 0.39]; // where Polaris sits in the panel (share of width, share of height)
const TILT = 9;              // how far the brightest stars shift with the cursor, in pixels
const REACH = 34;            // how close the cursor must be to a star to read it out, in pixels
const TOUR_EVERY = 6;        // seconds the readout stays on a star when nobody is pointing
const SUNSET = 3;            // how fast day turns to night and back (higher = faster)
const CLOUD_AREA = 90000;    // one cloud per this many square pixels
const SHOT_EVERY = [9, 24];  // seconds between shooting stars
const AZ = [60, 300];        // compass range across the sun chart (east on the left, west on the right)
const TOP_ALT = 66;          // the sun height that reaches the top of the sun chart, in degrees

const RAD = Math.PI / 180;
const NIGHT_BG = '#0A0A0C';
const ACCENT = '#2563EB';
const rand = (a, b) => a + Math.random() * (b - a);
const isDay = () => document.documentElement.getAttribute('data-theme') !== 'dark';
const mono = size => `500 ${size}px 'Geist Mono', ui-monospace, Menlo, Consolas, monospace`;
const starSize = mag => Math.max(0.45, Math.min(2.4, 2.35 - mag * 0.32));

export function NetworkCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current, g = canvas.getContext('2d'), box = canvas.parentElement;
    const { lat, lon } = site.place;
    let w = 0, h = 0, time = 0, raf = 0, last = 0, visible = true, slow = 0;
    let day = isDay() ? 1 : 0, dayGoal = day;          // 1 = full day, 0 = full night
    let clouds = [], shot = null, nextShot = rand(...SHOT_EVERY), grain = null;
    let path = null, pathKey = '', tourAt = 0, tourStar = TOUR[0];
    const pointer = { x: 0, y: 0, on: false };
    const tilt = { x: 0, y: 0 };

    /* ---------- setup ---------- */
    const makeCloud = x => {
      const rows = 2 + Math.floor(Math.random() * 2), len = rand(90, 190);
      return {
        x, y: rand(0.1, 0.46), speed: rand(3, 9), thick: rand(9, 14),
        rows: Array.from({ length: rows }, (_, i) => ({ dx: rand(-20, 40) + i * 14, len: len * rand(0.55, 1) })),
      };
    };

    const makeGrain = () => {
      const tile = document.createElement('canvas'), t = tile.getContext('2d');
      tile.width = tile.height = 128;
      const img = t.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) img.data[i + 3] = Math.random() * 22;   // black specks, very faint
      t.putImageData(img, 0, 0);
      return g.createPattern(tile, 'repeat');
    };

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wanted = Math.max(3, Math.round((w * h) / CLOUD_AREA));
      clouds = Array.from({ length: wanted }, () => makeCloud(rand(-100, w)));
      grain = makeGrain();
      if (reduceMotion) draw(0);
    };

    const text = (s, x, y, color, align = 'left', size = 9.5) => {
      g.font = mono(size); g.textAlign = align; g.fillStyle = color;
      try { g.letterSpacing = '1px'; } catch (e) {}
      g.fillText(s, x, y);
    };

    /* ---------- night: the star chart ---------- */
    const drawNight = (a, now, dt) => {
      const cx = w * CENTRE[0], cy = h * CENTRE[1], k = Math.max(h, w * 1.25) * SCALE;
      const lst = siderealTime(now, lon), turn = lst * 15 * RAD;
      const white = o => `rgba(255,255,255,${(o * a).toFixed(3)})`;
      /* From sky to screen. Facing north, a star due south of the pole is straight above it,
         and the whole sky turns anticlockwise. depth = how much the star follows the cursor. */
      const place = (ra, dec, depth = 0) => {
        const H = turn - ra * 15 * RAD, r = (90 - dec) * k;
        return [cx - r * Math.sin(H) + tilt.x * depth, cy - r * Math.cos(H) + tilt.y * depth];
      };
      const above = (ra, dec) => altAz(ra, dec, lst, lat).alt > 0;
      const inside = (x, y, m = 12) => x > -m && x < w + m && y > -m && y < h + m;

      /* grid: a circle every 10 degrees from the pole, a spoke every 2 hours of right ascension */
      g.lineWidth = 1; g.strokeStyle = white(0.07);
      g.beginPath();
      for (let d = 10; d <= 90; d += 10) { g.moveTo(cx + d * k, cy); g.arc(cx, cy, d * k, 0, Math.PI * 2); }
      for (let ra = 0; ra < 24; ra += 2) {
        const H = turn - ra * 15 * RAD;
        g.moveTo(cx - 10 * k * Math.sin(H), cy - 10 * k * Math.cos(H));
        g.lineTo(cx - 90 * k * Math.sin(H), cy - 90 * k * Math.cos(H));
      }
      g.stroke();
      for (const ra of [0, 6, 12, 18]) {
        const H = turn - (ra + 0.22) * 15 * RAD, r = 46 * k;
        const x = cx - r * Math.sin(H), y = cy - r * Math.cos(H);
        if (inside(x, y, -10)) text(String(ra).padStart(2, '0') + 'h', x, y, white(0.5), 'center', 9);
      }

      /* the horizon: every direction of the compass, at zero height */
      g.beginPath();
      let north = null;
      for (let az = 0; az <= 360; az += 3) {
        const dec = Math.asin(Math.cos(lat * RAD) * Math.cos(az * RAD));
        const H = (az < 180 ? -1 : 1) * Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat * RAD) * Math.tan(dec))));
        const r = (90 - dec / RAD) * k, x = cx - r * Math.sin(H), y = cy - r * Math.cos(H);
        if (az === 0) { north = [x, y]; g.moveTo(x, y); } else g.lineTo(x, y);
      }
      g.setLineDash([2, 5]); g.strokeStyle = white(0.3); g.stroke(); g.setLineDash([]);
      if (north && inside(...north, -8)) text('N · HORIZON', north[0], north[1] + 14, white(0.5), 'center', 9);

      /* background stars */
      for (const s of FIELD) {
        const [x, y] = place(s.ra, s.dec, 0.25);
        if (!inside(x, y, 2)) continue;
        const twinkle = reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(time * s.pace + s.phase);
        g.fillStyle = white((above(s.ra, s.dec) ? 0.62 : 0.14) * twinkle * (1 - (s.mag - 4.2) / 4));
        g.beginPath(); g.arc(x, y, starSize(s.mag), 0, Math.PI * 2); g.fill();
      }

      /* constellations */
      const at = {};
      for (const id in STARS) at[id] = place(STARS[id][0], STARS[id][1], Math.max(0.35, 1 - STARS[id][2] / 5));
      g.lineWidth = 0.8; g.lineJoin = 'round'; g.strokeStyle = white(0.34);
      g.beginPath();
      for (const fig of FIGURES) for (const line of fig.lines) line.forEach((id, i) => (i ? g.lineTo(...at[id]) : g.moveTo(...at[id])));
      g.stroke();
      for (const fig of FIGURES) {            // the name sits just outside the figure, on the side away from the pole
        const ids = [...new Set(fig.lines.flat())];
        const mx = ids.reduce((s, id) => s + at[id][0], 0) / ids.length - cx, my = ids.reduce((s, id) => s + at[id][1], 0) / ids.length - cy;
        const far = Math.max(...ids.map(id => Math.hypot(at[id][0] - cx, at[id][1] - cy))) + 18, len = Math.hypot(mx, my) || 1;
        const x = cx + (mx / len) * far, y = cy + (my / len) * far;
        if (inside(x, y, -24)) text(fig.name.toUpperCase(), x, y + 3, white(0.55), 'center');
      }

      /* the stars themselves */
      for (const id in STARS) {
        const [ra, dec, mag] = STARS[id], [x, y] = at[id];
        if (!inside(x, y, 3)) continue;
        g.fillStyle = white(above(ra, dec) ? 0.95 : 0.3);
        g.beginPath(); g.arc(x, y, starSize(mag), 0, Math.PI * 2); g.fill();
      }
      for (const id of NAMED) {
        const [x, y] = at[id];
        if (inside(x, y, -20)) text(STARS[id][3].toUpperCase(), x + 11, y + 3, white(id === 'polaris' ? 0.95 : 0.55));
      }
      g.strokeStyle = ACCENT; g.globalAlpha = a; g.lineWidth = 1.2;      // Polaris, the one fixed point
      g.beginPath(); g.arc(at.polaris[0], at.polaris[1], 7, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;

      /* readout: the star nearest the cursor, or the next stop of the tour */
      let pick = null;
      if (pointer.on) {
        let best = REACH;
        for (const id in STARS) {
          const d = Math.hypot(at[id][0] - pointer.x, at[id][1] - pointer.y);
          if (d < best && id !== 'polaris') { best = d; pick = id; }
        }
      } else {
        if (time - tourAt > TOUR_EVERY || !inside(...at[tourStar], -30)) {
          const open = TOUR.filter(id => inside(...at[id], -40) && at[id][1] < h * 0.66 && at[id][1] > 132);
          if (open.length) tourStar = open[(open.indexOf(tourStar) + 1) % open.length];
          tourAt = time;
        }
        if (inside(...at[tourStar], -30) && at[tourStar][1] < h * 0.7) pick = tourStar;
      }
      if (pick) {
        const [ra, dec, , name, des] = STARS[pick], [x, y] = at[pick], s = 8, c = 3;
        const fade = pointer.on || reduceMotion ? 1 : Math.min(1, (time - tourAt) * 2, (TOUR_EVERY - (time - tourAt)) * 2);
        g.strokeStyle = white(0.9 * Math.max(0, fade)); g.lineWidth = 1;
        g.beginPath();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          g.moveTo(x + sx * s, y + sy * (s - c)); g.lineTo(x + sx * s, y + sy * s); g.lineTo(x + sx * (s - c), y + sy * s);
        }
        g.stroke();
        const left = x > w * 0.55, tx = x + (left ? -16 : 16), align = left ? 'right' : 'left';
        const alt = altAz(ra, dec, lst, lat).alt;
        const lines = [`${des}${name ? ' · ' + name.toUpperCase() : ''}`, `RA ${raText(ra)} · DEC ${decText(dec)}`, alt > 0 ? `ALT ${alt.toFixed(1)}° ABOVE HORIZON` : 'BELOW THE HORIZON'];
        g.font = mono(9);
        try { g.letterSpacing = '1px'; } catch (e) {}
        const wide = Math.max(...lines.map(l => g.measureText(l).width)) + 12;
        g.fillStyle = `rgba(10,10,12,${(0.86 * a * Math.max(0, fade)).toFixed(3)})`;      // a dark plate, so the text stays readable over the lines
        g.fillRect(left ? tx - wide + 6 : tx - 6, y - 15, wide, 43);
        text(lines[0], tx, y - 4, white(0.95 * Math.max(0, fade)), align);
        text(lines[1], tx, y + 9, white(0.6 * Math.max(0, fade)), align, 9);
        text(lines[2], tx, y + 21, white(0.6 * Math.max(0, fade)), align, 9);
      }

      /* shooting star */
      if (!reduceMotion) {
        nextShot -= dt;
        if (nextShot <= 0 && !shot) { shot = { x: rand(w * 0.1, w * 0.9), y: rand(h * 0.08, h * 0.4), vx: rand(-420, -260), vy: rand(120, 220), life: 1 }; nextShot = rand(...SHOT_EVERY); }
        if (shot) {
          shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt * 1.5;
          const tail = g.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 0.22, shot.y - shot.vy * 0.22);
          tail.addColorStop(0, white(0.9 * Math.max(0, shot.life))); tail.addColorStop(1, white(0));
          g.strokeStyle = tail; g.lineWidth = 1.2;
          g.beginPath(); g.moveTo(shot.x, shot.y); g.lineTo(shot.x - shot.vx * 0.22, shot.y - shot.vy * 0.22); g.stroke();
          if (shot.life <= 0) shot = null;
        }
      }
    };

    /* ---------- day: the sun chart ---------- */
    const drawDay = (a, now, dt) => {
      const ink = o => `rgba(10,10,12,${(o * a).toFixed(3)})`;
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#D9E2EE'); sky.addColorStop(0.62, '#EEF1F5'); sky.addColorStop(1, '#F8F9FA');
      g.globalAlpha = a; g.fillStyle = sky; g.fillRect(0, 0, w, h);

      g.strokeStyle = '#FFFFFF'; g.lineCap = 'round';
      for (const c of clouds) {
        if (!reduceMotion) { c.x += c.speed * dt; if (c.x > w + 60) Object.assign(c, makeCloud(-260)); }
        g.lineWidth = c.thick; g.globalAlpha = a * 0.8;
        g.beginPath();
        c.rows.forEach((r, i) => { const y = c.y * h + i * (c.thick + 2); g.moveTo(c.x + r.dx, y); g.lineTo(c.x + r.dx + r.len, y); });
        g.stroke();
      }
      g.lineCap = 'butt'; g.globalAlpha = 1;

      const key = now.toDateString();
      if (key !== pathKey) { path = sunDay(now, lat, lon); pathKey = key; }
      const hy = h * 0.62, x0 = w * 0.07, x1 = w * 0.93, ky = (h * 0.46) / TOP_ALT;
      const X = az => x0 + ((az - AZ[0]) / (AZ[1] - AZ[0])) * (x1 - x0), Y = alt => hy - alt * ky;

      g.lineWidth = 1; g.strokeStyle = ink(0.06);                        // height lines
      g.beginPath();
      for (let alt = 10; alt <= Math.min(60, path.top + 12); alt += 10) { g.moveTo(x0, Y(alt)); g.lineTo(x1, Y(alt)); text(alt + '°', x0, Y(alt) - 5, ink(0.68), 'left', 9); }
      g.stroke();

      g.strokeStyle = ink(0.5);                                          // horizon and compass
      g.beginPath(); g.moveTo(w * 0.04, hy); g.lineTo(w * 0.96, hy);
      for (const [az, label] of [[90, 'E'], [180, 'S'], [270, 'W']]) { g.moveTo(X(az), hy); g.lineTo(X(az), hy + 7); text(label, X(az), hy + 21, ink(0.68), 'center'); }
      g.stroke();

      g.strokeStyle = ink(0.4); g.setLineDash([1, 5]); g.lineCap = 'round';   // today's path
      g.beginPath();
      let pen = false;
      for (const p of path.points) {
        if (p.alt < -0.9) { pen = false; continue; }
        if (pen) g.lineTo(X(p.az), Y(p.alt)); else g.moveTo(X(p.az), Y(p.alt));
        pen = true;
      }
      g.stroke(); g.setLineDash([]); g.lineCap = 'butt';
      g.fillStyle = ink(0.5);
      for (const p of path.points) if (p.m % 60 === 0 && p.alt > 1) { g.beginPath(); g.arc(X(p.az), Y(p.alt), 1.6, 0, Math.PI * 2); g.fill(); }
      for (const edge of [path.rise, path.set]) {
        if (!edge) continue;
        g.fillStyle = `rgba(248,249,250,${a})`; g.strokeStyle = ink(0.9);
        g.beginPath(); g.arc(X(edge.az), hy, 3, 0, Math.PI * 2); g.fill(); g.stroke();
        text(clock(edge.m), X(edge.az), hy + 36, ink(0.68), 'center');
      }

      const sun = sunNow(now, lat, lon), up = sun.alt > -0.833;          // the sun, where it is right now
      if (path.top > 4) {                                                // label the highest point, unless the sun is sitting on it
        const p = path.points[path.noon / 5];
        if (Math.hypot(X(p.az) - X(sun.az), Y(p.alt) - Y(sun.alt)) > 90) text('NOON ' + clock(path.noon), X(p.az), Y(p.alt) - 12, ink(0.68), 'center');
      }
      const sx = X(sun.az), sy = Y(Math.max(sun.alt, -7));
      if (up) {
        g.strokeStyle = ink(0.2); g.setLineDash([2, 4]);
        g.beginPath(); g.moveTo(sx, sy + 22); g.lineTo(sx, hy); g.stroke(); g.setLineDash([]);
        const beat = reduceMotion ? 0 : Math.sin(time * 0.8) * 2;
        g.strokeStyle = ink(0.09); g.beginPath(); g.arc(sx, sy, 44 + beat, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = ink(0.05); g.beginPath(); g.arc(sx, sy, 72 + beat * 1.5, 0, Math.PI * 2); g.stroke();
      }
      g.fillStyle = `rgba(255,255,255,${up ? a : a * 0.5})`; g.strokeStyle = ink(up ? 1 : 0.4);
      if (!up) g.setLineDash([2, 3]);
      g.beginPath(); g.arc(sx, sy, 20, 0, Math.PI * 2); g.fill(); g.stroke(); g.setLineDash([]);
      const left = sx > w * 0.56, tx = sx + (left ? -32 : 32), align = left ? 'right' : 'left';
      text(up ? 'SUN' : 'SUN BELOW HORIZON', tx, sy - 3, ink(1), align);
      text(up ? `ALT ${sun.alt.toFixed(1)}° · AZ ${sun.az.toFixed(1)}°` : path.rise ? `RISES ${clock(path.rise.m)}` : '', tx, sy + 10, ink(0.68), align, 9);

      if (grain) { g.globalAlpha = a; g.fillStyle = grain; g.fillRect(0, 0, w, h); g.globalAlpha = 1; }
    };

    /* ---------- one frame ---------- */
    const draw = dt => {
      const now = new Date();
      day += (dayGoal - day) * (reduceMotion ? 1 : Math.min(1, dt * SUNSET));
      if (Math.abs(dayGoal - day) < 0.002) day = dayGoal;
      const tx = pointer.on ? (pointer.x / w - 0.5) * -2 * TILT : 0, ty = pointer.on ? (pointer.y / h - 0.5) * -2 * TILT : 0;
      tilt.x += (tx - tilt.x) * Math.min(1, dt * 4); tilt.y += (ty - tilt.y) * Math.min(1, dt * 4);
      g.fillStyle = NIGHT_BG; g.fillRect(0, 0, w, h);
      if (day < 0.999) drawNight(1 - day, now, dt);
      if (day > 0.001) drawDay(day, now, dt);
    };

    const frame = t => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = t; return; }
      const dt = Math.min((t - last) / 1000 || 0, 0.05);
      last = t; time += dt;
      draw(dt);
    };

    /* ---------- events ---------- */
    const onMove = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = e.pointerType !== 'touch'; if (reduceMotion) draw(1); };
    const onLeave = () => { pointer.on = false; tourAt = time; if (reduceMotion) draw(1); };
    const onDown = e => {
      if (reduceMotion || day > 0.5 || shot) return;
      const r = canvas.getBoundingClientRect();
      shot = { x: e.clientX - r.left + 140, y: e.clientY - r.top - 70, vx: -380, vy: 190, life: 1 };
    };
    const themeWatch = new MutationObserver(() => { dayGoal = isDay() ? 1 : 0; if (reduceMotion) draw(1); });
    const sizeWatch = new ResizeObserver(resize);
    const seen = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });

    resize();
    sizeWatch.observe(box); seen.observe(box);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);
    box.addEventListener('pointerdown', onDown);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => reduceMotion && draw(0));
    if (reduceMotion) { draw(0); slow = setInterval(() => draw(0), 60000); }   // still follows the clock, once a minute
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); clearInterval(slow);
      sizeWatch.disconnect(); seen.disconnect(); themeWatch.disconnect();
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
      box.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return html`<canvas class="net" ref=${ref} role="img" aria-label=${'The sky above ' + site.place.name + ': a star chart at night, the path of the sun by day'}></canvas>`;
}
