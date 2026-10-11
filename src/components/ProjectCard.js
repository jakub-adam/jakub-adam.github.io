import { html } from '../lib/html.js';
import { Pic } from './Pic.js';
import { link } from '../lib/router.js';

export const ProjectCard = ({ project, index }) => html`
  <a class="tile" href=${link('portfolio', project.slug)}>
    <${Pic} index=${index} img=${project.img} />
    <h3>${project.title}</h3><small>${project.category}</small>
  </a>`;
