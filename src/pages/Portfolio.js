import { html, useState, Fragment } from '../lib/html.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { projects } from '../data/site.js';
import { link } from '../lib/router.js';

export function Portfolio() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  return html`<${Fragment}>
    <h1 class="title">Portfolio</h1>
    <p class="intro">A selection of things I have made.</p>
    <div class="acts"><a class="btn" href=${link('contact')}>If you are interested, get in touch</a></div>
    <div class="tabs">${categories.map(c => html`<button key=${c} className=${c === filter ? 'on' : ''} onClick=${() => setFilter(c)}>${c}</button>`)}</div>
    <div class="pg">${projects.map((p, i) => (filter === 'All' || p.category === filter) && html`<${ProjectCard} key=${p.slug} project=${p} index=${i} />`)}</div>
  <//>`;
}
