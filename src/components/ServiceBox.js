import { html } from '../lib/html.js';
import { Icon } from './Icon.js';

export const ServiceBox = ({ icon, title, text }) => html`
  <div class="box"><${Icon} name=${icon} /><h3>${title}</h3><p>${text}</p></div>`;
