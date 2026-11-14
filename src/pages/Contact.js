import { html, Fragment } from '../lib/html.js';
import { Icon } from '../components/Icon.js';
import { site, social } from '../data/site.js';

export const Contact = () => html`<${Fragment}>
  <div class="phead">
    <div>
      <h1 class="title">Contact</h1>
      <p class="intro">Calling is quickest. Otherwise email me or message me on any of these.</p>
    </div>
  </div>
  <div class="cl">
    <a href=${site.phone.href}><${Icon} name="phone" /><b>${site.phone.text}</b><span>Call</span></a>
    <a href=${site.email.href}><${Icon} name="mail" /><b>${site.email.text}</b><span>Email</span></a>
    ${social.filter(s => s.href || s.handle).map(s => s.href
      ? html`<a key=${s.name} href=${s.href} target="_blank" rel="noopener"><${Icon} name=${s.icon} /><b>${s.name}</b><span>${s.handle || 'Open'}</span></a>`
      : html`<a key=${s.name}><${Icon} name=${s.icon} /><b>${s.name}</b><span>${s.handle}</span></a>`)}
  </div>
<//>`;
