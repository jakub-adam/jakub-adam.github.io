import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { pages } from '../data/site.js';
import { link } from '../lib/router.js';

const ICONS = { home: 'home', about: 'user', portfolio: 'grid', lab: 'flask', news: 'news' };
const LABELS = { portfolio: 'Work' };   // shorter names for the small tabs

/* App-style navigation along the bottom of the screen on phones (hidden on larger screens) */
export const TabBar = ({ page }) => {
  const items = pages.filter(p => p[2] !== false);
  return html`
    <nav class="tabbar" aria-label="Pages" style=${{ '--n': items.length }}>
      ${items.map(([label, id]) => html`
        <a key=${id} href=${link(id)} className=${page === id ? 'on' : ''} aria-current=${page === id ? 'page' : undefined}>
          <${Icon} name=${ICONS[id] || 'grid'} /><span>${LABELS[id] || label}</span>
        </a>`)}
    </nav>`;
};
