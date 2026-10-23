import { html, useState } from '../lib/html.js';
import { site } from '../data/site.js';

/* Your photo on the home page (images/profile.jpg).
   A rounded card on a computer, a round avatar under the sky on a phone.
   The photo is cropped from the upper part, so faces stay in frame.
   Until a photo exists it shows your initials instead. */
export function Portrait() {
  const [failed, setFailed] = useState(false);
  const initials = site.name.split(' ').map(word => word[0]).join('');
  return html`
    <div class="portrait">
      ${failed
        ? html`<span class="portrait-initials" aria-hidden="true">${initials}</span>`
        : html`<img src=${site.photo} alt=${'Photo of ' + site.name} onError=${() => setFailed(true)} />`}
    </div>`;
}
