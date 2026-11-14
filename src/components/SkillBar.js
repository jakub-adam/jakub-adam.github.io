import { html } from '../lib/html.js';
import { Meter } from './Meter.js';

/* One skill on the About page. It used to be a filled bar; it is now a row of ticks (see Meter.js).
   "color" is still accepted so the entries in src/data/site.js need no change, but every meter uses the text color. */
export const SkillBar = ({ name, value }) => html`<${Meter} name=${name} value=${value} />`;
