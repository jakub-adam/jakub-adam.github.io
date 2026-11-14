import { html, useState, useEffect, useRef } from '../lib/html.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { GithubRepos } from '../components/GithubRepos.js';
import { Pic } from '../components/Pic.js';
import { ProjectDetail } from './ProjectDetail.js';
import { projects } from '../data/site.js';
import { link } from '../lib/router.js';

const two = n => String(n).padStart(2, '0');

/* The portfolio: filters with a line that slides to the chosen one, then every project as a row.
   Pointing at a row (or reaching it with Tab) shows a small preview beside it.
   Opening a row (#/portfolio/<slug>) slides ProjectDetail in over the list, so closing it puts you right back. */
export function Portfolio({ id }) {
  const [filter, setFilter] = useState('All');
  const [peek, setPeek] = useState(null);          // { project, index, y }: the row the preview belongs to
  const [peeking, setPeeking] = useState(false);
  const [line, setLine] = useState(null);
  const tabs = useRef(null);
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const shown = projects.filter(p => filter === 'All' || p.category === filter);

  useEffect(() => {                                 // put the line under the chosen filter
    const place = () => {
      const on = tabs.current && tabs.current.querySelector('[aria-pressed=true]');
      if (on) setLine({ left: on.offsetLeft, width: on.offsetWidth });
    };
    place();
    addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return () => removeEventListener('resize', place);
  }, [filter]);

  return html`<div class="pfolio">
    <div class="phead">
      <div>
        <h1 class="title">Portfolio</h1>
        <p class="intro">Things I have made, some finished, some not quite. Point at a row for a preview, open it for the full story.</p>
      </div>
      <div class="phead-side">
        <span class="count">${shown.length} ${shown.length === 1 ? 'project' : 'projects'} · newest first</span>
        <a class="btn ghost sm" href=${link('contact')}>Like something here? Get in touch</a>
      </div>
    </div>

    <div class="tabs" ref=${tabs} role="group" aria-label="Filter projects" style=${{ '--n': categories.length }}>
      ${categories.map(c => html`
        <button key=${c} className=${c === filter ? 'on' : ''} aria-pressed=${c === filter} onClick=${() => { setFilter(c); setPeeking(false); }}>
          ${c}<small>${c === 'All' ? projects.length : projects.filter(p => p.category === c).length}</small>
        </button>`)}
      ${line && html`<i class="tabs-line" style=${{ width: line.width + 'px', transform: `translateX(${line.left}px)` }}></i>`}
    </div>

    <div class="rows" onPointerLeave=${() => setPeeking(false)} onBlur=${() => setPeeking(false)}>
      ${shown.map((p, i) => html`<${ProjectCard} key=${p.slug} project=${p} n=${two(i + 1)}
        onPeek=${el => { setPeek({ project: p, index: projects.indexOf(p), y: el.offsetTop + el.offsetHeight / 2 }); setPeeking(true); }} />`)}
      <figure class=${'peek' + (peeking && peek ? ' on' : '')} style=${{ '--y': (peek ? peek.y : 0) + 'px' }} aria-hidden="true">
        ${peek && html`<${Pic} index=${peek.index} img=${peek.project.img} art=${peek.project.art} />`}
        <figcaption><span>Preview · ${peek ? peek.project.title : ''}</span><span>Enter to open</span></figcaption>
      </figure>
    </div>

    <div class="sec-pad">
      <h2 class="lab">On GitHub</h2>
      <${GithubRepos} />
    </div>

    ${id && html`<${ProjectDetail} key=${id} id=${id} />`}
  </div>`;
}
