import { html } from '../lib/html.js';

/* A level from 0 to 100 as a row of twenty ticks with the number beside it.
   Used for skills and languages on the About page (through SkillBar.js and Ring.js). */
export const Meter = ({ name, value }) => html`
  <div class="meter">
    <span>${name}</span>
    <i class="ticks" style=${{ '--v': value }} role="img" aria-label=${value + ' out of 100'}></i>
    <span class="meter-n">${value}<small> /100</small></span>
  </div>`;
