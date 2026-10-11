import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { social } from '../data/site.js';

export const SocialLinks = () => social.filter(s => s.href).map(s => html`
  <a key=${s.name} href=${s.href} target="_blank" rel="noopener" aria-label=${s.name}><${Icon} name=${s.icon} /></a>`);
