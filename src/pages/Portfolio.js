import { html, useState } from '../lib/html.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { GithubRepos } from '../components/GithubRepos.js';
import { projects } from '../data/site.js';
import { link } from '../lib/router.js';

/* On a computer the order is: title, intro, contact button, filters, projects, GitHub.
   On a phone the contact button moves below the projects (see .pfolio in global.css). */
export function Portfolio() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const shown = projects.filter(p => filter === 'All' || p.category === filter);
  return html`<div class="pfolio">
    <h1 class="title">Portfolio</h1>
    <p class="intro">A selection of things I have made.</p>
    <div class="acts"><a class="btn" href=${link('contact')}>If you are interested, get in touch</a></div>
    <div class="tabs" role="group" aria-label="Filter projects" style=${{ '--n': categories.length }}>${categories.map(c => html`<button key=${c} className=${c === filter ? 'on' : ''} aria-pressed=${c === filter} onClick=${() => setFilter(c)}>${c}</button>`)}</div>
    <div class="pg" data-feat=${filter === 'All'}>${projects.map((p, i) => shown.includes(p) && html`<${ProjectCard} key=${p.slug} project=${p} index=${i} />`)}</div>
    <h2 class="lab">Live from GitHub</h2>
    <${GithubRepos} />
  </div>`;
}
