import { html } from '../lib/html.js';

/* color is a CSS variable name from global.css: '--accent', '--accent-2' or '--accent-3' */
export const SkillBar = ({ name, value, color }) => html`
  <div class="sk">
    <p><span>${name}</span><span>${value}%</span></p>
    <div class="tr"><div class="fl" style=${{ width: value + '%', '--bar-color': `var(${color})` }}></div></div>
  </div>`;
