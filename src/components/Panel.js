import { html, useState } from '../lib/html.js';
import { site } from '../data/site.js';


export function Panel() {
  const [hasPhoto, setHasPhoto] = useState(true);
  return html`
    <aside class="panel" aria-hidden="true">
      <div class="mono">JA</div>
      ${hasPhoto && html`<img src=${site.photo} alt="" onError=${() => setHasPhoto(false)} />`}
    </aside>`;
}
