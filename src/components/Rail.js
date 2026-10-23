import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { site } from '../data/site.js';
import { link } from '../lib/router.js';

/* The thin bar on the right edge (hidden on phones). The AI assistant lives here.
   The assistant button is hidden (but keeps its space) while the assistant is open, so the icon is not repeated.
   The site name collapses on the Contact page, where it would only repeat what is already there. */
export const Rail = ({ onAssistant }) => html`
  <div class="rail">
    <a class=${'ai' + (onAssistant ? ' here' : '')} tabIndex=${onAssistant ? -1 : undefined} aria-hidden=${onAssistant ? 'true' : undefined} href=${link('lab', 'assistant')} data-tip="Ask Jakub" aria-label="Ask Jakub, the AI assistant"><${Icon} name="chat" /></a>
    <span>${site.domain}</span>
  </div>`;
