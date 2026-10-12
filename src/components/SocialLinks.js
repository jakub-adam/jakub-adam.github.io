import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { social } from '../data/site.js';

/* Icon-only links. Used in the side rail and in the footer on phones. */
export const SocialLinks = () => social.filter(s => s.href).map(s => html`
  <a key=${s.name} href=${s.href} target="_blank" rel="noopener" aria-label=${s.name}><${Icon} name=${s.icon} /></a>`);
