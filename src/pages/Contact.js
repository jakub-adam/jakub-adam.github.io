import { html, Fragment } from '../lib/html.js';
import { Icon } from '../components/Icon.js';
import { site, social } from '../data/site.js';

export const Contact = () => html`<${Fragment}>
  <h1 class="title">Contact</h1>
  <p class="intro">Calling is quickest. Otherwise email me or message me on any of these.</p>
  <div class="cl">
    <a href=${site.phone.href}><${Icon} name="phone" />${site.phone.text}<span>Call</span></a>
    <a href=${site.email.href}><${Icon} name="mail" />${site.email.text}<span>Email</span></a>
    ${social.filter(s => s.href || s.handle).map(s => s.href
      ? html`<a key=${s.name} href=${s.href} target="_blank" rel="noopener"><${Icon} name=${s.icon} />${s.name}<span>${s.handle || 'Open'}</span></a>`
      : html`<a key=${s.name}><${Icon} name=${s.icon} />${s.name}<span>${s.handle}</span></a>`)}
  </div>
<//>`;
