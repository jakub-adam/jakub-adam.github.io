import { html } from '../lib/html.js';
import { SocialLinks } from './SocialLinks.js';
import { site } from '../data/site.js';

export const SocialRail = () => html`
  <div class="rail"><${SocialLinks} /><span>${site.domain}</span></div>`;
