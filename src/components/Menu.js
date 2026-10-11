import { html, useEffect } from '../lib/html.js';
import { pages } from '../data/site.js';
import { link } from '../lib/router.js';

export function Menu({ open, close, page }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && close();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  const tab = open ? 0 : -1; 
  return html`
    <div class=${'menu' + (open ? ' open' : '')} aria-hidden=${!open}>
      <button class="x" onClick=${close} aria-label="Close menu" tabIndex=${tab}>×</button>
      <nav aria-label="Pages">
        ${pages.map(([label, id], i) => html`
          <a key=${id} href=${link(id)} style=${{ '--i': i }} className=${page === id ? 'on' : ''} onClick=${close} tabIndex=${tab}>${label}</a>`)}
      </nav>
    </div>`;
}
