import { html } from '../lib/html.js';

export const TimelineCard = ({ date, title, text }) => html`
  <div class="box"><span class="chip">${date}</span><h3>${title}</h3><p>${text}</p></div>`;
