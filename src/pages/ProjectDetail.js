import { html, useState, useEffect, useRef } from '../lib/html.js';
import { Pic, Schematic, schematics } from '../components/Pic.js';
import { Icon } from '../components/Icon.js';
import { SampleTag } from '../components/SampleTag.js';
import { projects } from '../data/site.js';
import { navigate } from '../lib/router.js';
import { reduceMotion } from '../lib/motion.js';

const host = url => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* Sub screen: #/portfolio/<slug>. A sheet that slides in from the right, over the portfolio list.
   Close it with the button, Esc, or a click on the dimmed page behind it.
   What it shows comes from the project's entry in src/data/site.js (see the notes there). */
export function ProjectDetail({ id }) {
  const index = projects.findIndex(p => p.slug === id);
  const p = projects[index];
  const [closing, setClosing] = useState(false);
  const closer = useRef(null);
  const drawn = p && !p.img && schematics(p.art);

  const close = () => {
    if (reduceMotion) return navigate('portfolio');
    setClosing(true);
    setTimeout(() => navigate('portfolio'), 260);     // let it slide out first
  };

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && !document.querySelector('.pal-wrap.open') && close();
    addEventListener('keydown', onKey);
    document.documentElement.classList.add('sheet-open');   // stops the page behind from scrolling
    if (closer.current) closer.current.focus({ preventScroll: true });
    return () => { removeEventListener('keydown', onKey); document.documentElement.classList.remove('sheet-open'); };
  }, []);

  return html`
    <div class=${'sheet-wrap' + (closing ? ' closing' : '')} onMouseDown=${e => e.target === e.currentTarget && close()}>
      <article class="sheet" role="dialog" aria-modal="true" aria-label=${p ? p.title : 'Project not found'}>
        <div class="sheet-bar">
          <span class="crumb">Portfolio / <b>${p ? p.title : 'Not found'}</b></span>
          <span class="sheet-close"><kbd>Esc</kbd><button class="kbtn ibtn" ref=${closer} onClick=${close} aria-label="Close"><${Icon} name="x" /></button></span>
        </div>
        ${!p ? html`<div class="sheet-head"><h1 class="title">Project not found</h1><p class="intro">There is no project at this address.</p></div>` : html`
          <div class="sheet-head">
            <div class="sheet-title"><h1 class="title">${p.title}</h1>${p.tagline && html`<em>${p.tagline}</em>`}${p.sample && html`<${SampleTag} />`}</div>
            ${p.body.map((t, i) => html`<p class="intro" key=${i}>${t}</p>`)}
            ${(p.link || p.source) && html`<div class="acts">
              ${p.link && html`<a class="btn arrow" data-magnet href=${p.link} target="_blank" rel="noopener">Open ${host(p.link)}<${Icon} name="out" /></a>`}
              ${p.source && html`<a class=${'btn arrow' + (p.link ? ' ghost' : '')} href=${p.source} target="_blank" rel="noopener">Source on GitHub<${Icon} name="out" /></a>`}
            </div>`}
          </div>
          ${drawn
            ? html`<div class="shots">${drawn.map(part => html`<${Schematic} key=${part.label} part=${part} />`)}</div>`
            : html`<div class="sheet-art"><${Pic} index=${index} img=${p.img} /></div>`}
          ${p.spec && html`<section class="sheet-sec">
            <h2 class="eyebrow">Specification</h2>
            <dl class="spec">${p.spec.map(([k, v]) => html`<div key=${k}><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
          </section>`}
          ${p.parts && html`<section class="sheet-sec">
            <h2 class="eyebrow">${p.partsTitle || 'In detail'}</h2>
            <div class="parts">${p.parts.map(([k, v]) => html`<div key=${k}><b>${k}</b><span>${v}</span></div>`)}</div>
          </section>`}`}
      </article>
    </div>`;
}
