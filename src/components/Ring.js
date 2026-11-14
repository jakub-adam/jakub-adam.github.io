import { html } from '../lib/html.js';
import { Meter } from './Meter.js';

/* One language on the About page. It used to be a ring; it is now a row of ticks (see Meter.js),
   so skills and languages read as one table. */
export const Ring = ({ name, value }) => html`<${Meter} name=${name} value=${value} />`;
