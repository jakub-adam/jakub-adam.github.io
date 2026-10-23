import { html, Fragment } from '../lib/html.js';
import { SkillBar } from '../components/SkillBar.js';
import { Ring } from '../components/Ring.js';
import { ServiceBox } from '../components/ServiceBox.js';
import { TimelineCard } from '../components/TimelineCard.js';
import { SampleTag } from '../components/SampleTag.js';
import { about, samples } from '../data/site.js';

/* Shows a "Sample" badge next to a heading while that section still holds placeholder content */
const Label = ({ text, sample }) => html`<h2 class="lab rv">${text}${sample && html`<${SampleTag} />`}</h2>`;

export const About = () => html`<${Fragment}>
  <h1 class="title">About</h1>
  <p class="intro">${about.intro}</p>

  <${Label} text="Right now" sample=${samples.now} />
  <p class="rv intro" style=${{ margin: 0 }}>${about.now}</p>

  <${Label} text="Details" />
  <div class="info rv">${about.info.map(([k, v]) => html`<p key=${k}><b>${k}:</b> <span>${v}</span></p>`)}</div>

  <div class="two">
    <div><${Label} text="Skills" sample=${samples.skills} />
      <div class="rv">${about.skills.map(([name, value, color]) => html`<${SkillBar} key=${name} name=${name} value=${value} color=${color} />`)}</div></div>
    <div><${Label} text="Languages" sample=${samples.languages} />
      <div class="rings rv">${about.languages.map(([name, value, color]) => html`<${Ring} key=${name} name=${name} value=${value} color=${color} />`)}</div></div>
  </div>

  <${Label} text="What I do" sample=${samples.services} />
  <div class="sv rv">${about.services.map(s => html`<${ServiceBox} key=${s.title} ...${s} />`)}</div>

  <div class="two">
    <div><${Label} text="Education" sample=${samples.education} /><div class="stack rv">${about.education.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}</div></div>
    <div><${Label} text="Experience" sample=${samples.experience} /><div class="stack rv">${about.experience.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}</div></div>
  </div>
<//>`;
