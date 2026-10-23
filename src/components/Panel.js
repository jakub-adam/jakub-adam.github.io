import { html } from '../lib/html.js';
import { NetworkCanvas } from './NetworkCanvas.js';
import { HeroName } from './HeroName.js';
import { site } from '../data/site.js';

/* The panel on the left: a sky that is daytime in the light theme and night in the dark theme
   (drawn by NetworkCanvas.js). On the home page your name sits in it,
   on the other pages it shows the faint JA mark. On phones it is the top of the
   home page and is hidden everywhere else. Your photo lives on the home page (see Home.js). */
export const Panel = ({ page }) => html`
  <div class="panel">
    <${NetworkCanvas} />
    ${page === 'home'
      ? html`<div class="sky-copy">
          <${HeroName} lines=${site.name.split(' ')} />
          <p class="sky-lead">${site.lead}</p>
        </div>`
      : html`<div class="mono" aria-hidden="true">JA</div>`}
  </div>`;
