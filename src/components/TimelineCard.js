import { html } from '../lib/html.js';

/* Used for Education and Experience: the years on the left, what and where on the right */
export const TimelineCard = ({ date, title, text }) => html`
  <div class="trow"><span class="chip">${date.replace(' - ', ' – ')}</span><div><h3>${title}</h3><p>${text}</p></div></div>`;
