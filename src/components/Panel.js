import { html, useState } from '../lib/html.js';
import { NetworkCanvas } from './NetworkCanvas.js';
import { site } from '../data/site.js';

/* The fixed panel on the left. It shows your photo (images/profile.jpg).
   Until you add one, it shows the JA mark with a slow starfield that follows the theme. */
export function Panel() {
  const [hasPhoto, setHasPhoto] = useState(true);
  return html`
    <aside class=${'panel' + (hasPhoto ? '' : ' bare')} aria-hidden="true">
      <div class="mono">JA</div>
      ${hasPhoto
        ? html`<img src=${site.photo} alt="" onError=${() => setHasPhoto(false)} />`
        : html`<${NetworkCanvas} />`}
    </aside>`;
}
