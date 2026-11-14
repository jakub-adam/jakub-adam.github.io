import { html } from '../lib/html.js';
import { SocialLinks } from './SocialLinks.js';
import { site } from '../data/site.js';

/* One quiet line at the end of every page: the year, your links and how the site is made.
   (The dark / light switch lives in the header; components/ThemeToggle.js is still there if you want it back here.) */
export const Footer = () => html`
  <footer>
    <span>© ${new Date().getFullYear()} ${site.name}</span>
    <span class="fsoc"><${SocialLinks} /></span>
    <span>${site.tagline}</span>
  </footer>`;
