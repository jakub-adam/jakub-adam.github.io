import { html, Fragment } from '../lib/html.js';
import { SkillBar } from '../components/SkillBar.js';
import { Ring } from '../components/Ring.js';
import { ServiceBox } from '../components/ServiceBox.js';
import { TimelineCard } from '../components/TimelineCard.js';
import { about } from '../data/site.js';

export const About = () => html`<${Fragment}>
  <h1 class="title">About</h1>
  <p class="intro">${about.intro}</p>

  <h2 class="lab">Personal informations</h2>
  <div class="info">${about.info.map(([k, v]) => html`<p key=${k}><b>${k}:</b> <span>${v}</span></p>`)}</div>

  <div class="two">
    <div><h2 class="lab">Skills</h2>
      ${about.skills.map(([name, value, color]) => html`<${SkillBar} key=${name} name=${name} value=${value} color=${color} />`)}</div>
    <div><h2 class="lab">Languages</h2>
      <div class="rings">${about.languages.map(([name, value, color]) => html`<${Ring} key=${name} name=${name} value=${value} color=${color} />`)}</div></div>
  </div>

  <h2 class="lab">What I do</h2>
  <div class="sv">${about.services.map(s => html`<${ServiceBox} key=${s.title} ...${s} />`)}</div>

  <div class="two">
    <div><h2 class="lab">Education</h2><div class="stack">${about.education.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}</div></div>
    <div><h2 class="lab">Experience</h2><div class="stack">${about.experience.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}</div></div>
  </div>
<//>`;
