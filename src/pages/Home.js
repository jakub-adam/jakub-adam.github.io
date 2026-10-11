import { html } from '../lib/html.js';
import { HeroName } from '../components/HeroName.js';
import { site } from '../data/site.js';
import { link } from '../lib/router.js';

export const Home = () => html`
  <section class="hero">
    <${HeroName} lines=${site.name.split(' ')} />
    <p class="intro">${site.lead}</p>
    <div class="acts"><a class="btn" href=${link('portfolio')}>View portfolio</a><a class="btn ghost" href=${link('contact')}>Get in touch</a></div>
  </section>`;
