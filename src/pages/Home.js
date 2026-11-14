import { html } from '../lib/html.js';
import { Icon } from '../components/Icon.js';
import { Portrait } from '../components/Portrait.js';
import { site, social, projects, labTools } from '../data/site.js';
import { link } from '../lib/router.js';

/* The home page. Your name is in the sky panel (see Panel.js), so this side holds your
   portrait, a short hello and three cells that lead into the site: the latest project
   (the first one in src/data/site.js), the Lab tools and the ways to reach you. */
const latest = projects[0];
const host = url => (url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
const mac = /Mac|iPhone|iPad/.test(navigator.platform);

/* "Hey, I'm Jakub." with the last word set in the serif italic */
const hello = site.hello.split(' ');
const lastWord = hello.pop();

const Cell = ({ n, label, title, href, children }) => html`
  <a class="cell" href=${href}>
    <small><span>${n}</span>${label}<${Icon} name="out" /></small>
    <b>${title}</b>
    ${children}
  </a>`;

export const Home = () => html`
  <section class="home">
    <div class="hello">
      <${Portrait} />
      <div>
        <h2 class="hello-title">${hello.join(' ')} <em>${lastWord}</em></h2>
        <p class="intro">${site.bio}</p>
        <div class="acts">
          <a class="btn arrow" data-magnet href=${link('portfolio')}>View portfolio<${Icon} name="arrow" /></a>
          <span class="hint">or press ${mac ? '⌘' : 'Ctrl'} K to jump anywhere</span>
        </div>
      </div>
    </div>

    <div class="cells">
      <${Cell} n="01" label="Latest project" title=${latest.title} href=${link('portfolio', latest.slug)}>
        <span class="cell-text">${latest.summary}</span>
        ${latest.link && html`<span class="cell-foot">${latest.live && html`<i class="dot"></i>`}${host(latest.link)}</span>`}
      <//>
      <${Cell} n="02" label="Lab" title=${labTools.length + ' small tools'} href=${link('lab')}>
        <span class="cell-rows">${labTools.map(t => html`<span key=${t[0]}><span>${t[1]}</span><span>${t[3]}</span></span>`)}</span>
      <//>
      <${Cell} n="03" label="Contact" title=${site.phone.text} href=${link('contact')}>
        <span class="cell-list">
          ${social.filter(s => s.handle).map(s => html`<span key=${s.name}><span>${s.name}</span><span>${s.handle}</span></span>`)}
          <span><span>Email</span><span>${site.email.text}</span></span>
        </span>
      <//>
    </div>
  </section>`;
