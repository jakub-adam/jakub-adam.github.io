import { html, Fragment } from '../lib/html.js';
import { Pic } from '../components/Pic.js';
import { projects } from '../data/site.js';
import { link } from '../lib/router.js';

/* Sub screen: #/portfolio/<slug> */
export function ProjectDetail({ id }) {
  const index = projects.findIndex(p => p.slug === id);
  const p = projects[index];
  if (!p) return html`<${Fragment}><a class="back" href=${link('portfolio')}>Back to portfolio</a><h1 class="title">Project not found</h1><//>`;
  return html`<${Fragment}>
    <a class="back" href=${link('portfolio')}>Back to portfolio</a>
    <h1 class="title">${p.title}</h1>
    <p class="meta">${p.category}</p>
    <div class="wide"><${Pic} index=${index} img=${p.img} /></div>
    <div class="prose">${p.body.map((t, i) => html`<p key=${i}>${t}</p>`)}</div>
    ${p.link && html`<div class="acts" style=${{ marginTop: '2rem' }}><a class="btn" href=${p.link} target="_blank" rel="noopener">Open project</a></div>`}
  <//>`;
}
