import { html } from '../lib/html.js';
import { Icon } from '../components/Icon.js';
import { Portrait } from '../components/Portrait.js';
import { site, projects, labTools } from '../data/site.js';
import { link } from '../lib/router.js';

/* The home page. Your name is in the star panel (see Panel.js),
   so this side holds your photo, a short hello and three shortcuts into the site.
   (Ask Jakub is left out here because the round chat button on the right already opens it.) */
const latest = projects[0];

const shortcuts = [
  { label: 'Latest project', title: latest.title, text: latest.summary, href: link('portfolio', latest.slug) },
  { label: 'Lab', title: labTools.length + ' small tools', text: labTools.map(t => t[1]).join(', '), href: link('lab') },
  { label: 'Contact', title: site.phone.text, text: 'Or find me on Instagram and GitHub', href: link('contact') },
];

export const Home = () => html`
  <section class="home">
    <div class="hello">
      <${Portrait} />
      <div>
        <h2 class="hello-title">${site.hello}</h2>
        <p class="intro">${site.bio}</p>
        <div class="acts">
          <a class="btn" href=${link('portfolio')}>View portfolio</a>
        </div>
      </div>
    </div>

    <div class="shortcuts">
      ${shortcuts.map(s => html`
        <a class="shortcut" key=${s.label} href=${s.href}>
          <small>${s.label}</small>
          <b>${s.title}</b>
          <span>${s.text}</span>
          <${Icon} name="arrow" />
        </a>`)}
    </div>
  </section>`;
