import { html } from '../lib/html.js';
import { SocialLinks } from './SocialLinks.js';
import { ThemeToggle } from './ThemeToggle.js';
import { site } from '../data/site.js';

/* A full-width bar along the bottom of the screen (it scrolls with the page on phones) */
export const Footer = () => html`
  <footer>
    <span>© ${new Date().getFullYear()} ${site.name} · ${site.domain}</span>
    <span class="fsoc"><${SocialLinks} /></span>
    <${ThemeToggle} />
  </footer>`;
