import { html, useEffect, useRef } from '../lib/html.js';
import { reduceMotion } from '../lib/motion.js';


const LIFT = 0.14;   
const REACH = 1.6;  
const EASE = 0.14;   

export function HeroName({ lines }) {
  const root = useRef(null);

  useEffect(() => {
    if (reduceMotion) return;
    const zone = root.current.parentElement;      
    const letters = [...root.current.querySelectorAll('.ch')];
    const y = letters.map(() => 0);
    let px = 0, py = 0, inside = false, raf = 0;

    const frame = () => {
      const size = parseFloat(getComputedStyle(root.current).fontSize);
      let moving = false;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const dist = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2 - y[i]));
        const k = inside ? Math.max(0, 1 - dist / (size * REACH)) : 0;
        const goal = -size * LIFT * k * k * (3 - 2 * k);  // smoothstep falloff
        y[i] += (goal - y[i]) * EASE;
        if (Math.abs(goal - y[i]) > 0.05) moving = true;
        el.style.transform = `translate3d(0, ${y[i].toFixed(2)}px, 0)`;
      });
      raf = moving || inside ? requestAnimationFrame(frame) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const move = e => { px = e.clientX; py = e.clientY; inside = true; start(); };
    const leave = () => { inside = false; start(); };

    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); zone.removeEventListener('pointermove', move); zone.removeEventListener('pointerleave', leave); };
  }, []);

  let n = 0; 
  return html`
    <h1 class="name" ref=${root} aria-label=${lines.join(' ')}>
      ${lines.map(word => html`
        <span class="row" key=${word} aria-hidden="true">
          ${[...word].map(ch => html`<span class="ch" key=${n} style=${{ animationDelay: (n++ * 70) + 'ms' }}>${ch}</span>`)}
        </span>`)}
    </h1>`;
}
