import { html, useEffect, Fragment } from '../lib/html.js';
import { pages } from '../data/site.js';
import { link } from '../lib/router.js';

/* A regular dropdown menu that rolls down from the header. Click outside, press Esc
   or pick a page to close it. Pages marked false in src/data/site.js are left out. */
export function Menu({ open, close, page }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === 'Escape' && close();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  const tab = open ? 0 : -1; // keep hidden links out of the keyboard order
  return html`<${Fragment}>
    <div class=${'scrim' + (open ? ' on' : '')} onClick=${close}></div>
    <nav class=${'menu' + (open ? ' open' : '')} aria-label="Pages" aria-hidden=${!open}>
      ${pages.filter(p => p[2] !== false).map(([label, id]) => html`<a key=${id} href=${link(id)} className=${page === id ? 'on' : ''} onClick=${close} tabIndex=${tab}>${label}</a>`)}
    </nav>
  <//>`;
}
