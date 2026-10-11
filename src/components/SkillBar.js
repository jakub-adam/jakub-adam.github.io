import { html } from '../lib/html.js';

export const SkillBar = ({ name, value, color }) => html`
  <div class="sk">
    <p><span>${name}</span><span>${value}%</span></p>
    <div class="tr"><div class="fl" style=${{ width: value + '%', '--c': `var(${color})` }}></div></div>
  </div>`;
