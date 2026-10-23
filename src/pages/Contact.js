import { html, Fragment } from '../lib/html.js';
import { Icon } from '../components/Icon.js';
import { site, social } from '../data/site.js';

export const Contact = () => html`<${Fragment}>
  <h1 class="title">Contact</h1>
  <p class="intro">Calling is quickest. Otherwise message me on any of these.</p>
  <div class="cl">
    <a href=${site.phone.href}><${Icon} name="phone" />${site.phone.text}<span>Call</span></a>
    ${social.filter(s => s.href).map(s => html`
      <a key=${s.name} href=${s.href} target="_blank" rel="noopener"><${Icon} name=${s.icon} />${s.name}<span>${s.handle || 'Open'}</span></a>`)}
  </div>
<//>`;
