import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { SampleTag } from './SampleTag.js';
import { link } from '../lib/router.js';

/* One project as a row in the portfolio list: number, title and summary, category and stack.
   onPeek tells the page which row the cursor (or the keyboard) is on, so it can show the preview next to it. */
export const ProjectCard = ({ project, n, onPeek }) => html`
  <a class="prow" href=${link('portfolio', project.slug)}
    onPointerEnter=${e => onPeek && onPeek(e.currentTarget)} onFocus=${e => onPeek && onPeek(e.currentTarget)}>
    <span class="prow-n">${n}</span>
    <span class="prow-main">
      <span class="prow-title"><b>${project.title}</b>${project.live && html`<em class="live"><i class="dot"></i>Live</em>`}${project.sample && html`<${SampleTag} />`}</span>
      <span class="prow-text">${project.summary}</span>
    </span>
    <span class="prow-meta"><span>${project.category}</span>${project.stack && html`<span>${project.stack.join(' · ')}</span>`}</span>
    <${Icon} name="arrow" />
  </a>`;
