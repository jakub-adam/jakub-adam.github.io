import { html, Fragment } from '../lib/html.js';
import { SkillBar } from '../components/SkillBar.js';
import { Ring } from '../components/Ring.js';
import { ServiceBox } from '../components/ServiceBox.js';
import { TimelineCard } from '../components/TimelineCard.js';
import { SampleTag } from '../components/SampleTag.js';
import { about, samples } from '../data/site.js';

/* One numbered section: the label on the left, the content on the right.
   It shows a "Sample" badge while that section still holds placeholder content. */
const Sec = ({ n, title, sample, children }) => html`
  <section class="sec rv">
    <h2 class="eyebrow"><span>${n}</span>${title}${sample && html`<${SampleTag} />`}</h2>
    <div class="sec-body">${children}</div>
  </section>`;

export const About = () => html`<${Fragment}>
  <div class="phead">
    <div>
      <h1 class="title">About</h1>
      <p class="intro">${about.intro}</p>
    </div>
  </div>

  <${Sec} n="01" title="Right now" sample=${samples.now}><p class="now">${about.now}</p><//>

  <${Sec} n="02" title="Details">
    <dl class="info">${about.info.map(([k, v]) => html`<div key=${k}><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
  <//>

  <${Sec} n="03" title="Skills" sample=${samples.skills}>
    ${about.skills.map(([name, value, color]) => html`<${SkillBar} key=${name} name=${name} value=${value} color=${color} />`)}
  <//>

  <${Sec} n="04" title="Languages" sample=${samples.languages}>
    ${about.languages.map(([name, value, color]) => html`<${Ring} key=${name} name=${name} value=${value} color=${color} />`)}
  <//>

  <${Sec} n="05" title="What I do" sample=${samples.services}>
    <div class="sv">${about.services.map(s => html`<${ServiceBox} key=${s.title} ...${s} />`)}</div>
  <//>

  <${Sec} n="06" title="Education" sample=${samples.education}>
    ${about.education.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}
  <//>

  <${Sec} n="07" title="Experience" sample=${samples.experience}>
    ${about.experience.map(e => html`<${TimelineCard} key=${e.title} ...${e} />`)}
  <//>
<//>`;
