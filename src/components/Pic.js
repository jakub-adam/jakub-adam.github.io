import { html } from '../lib/html.js';

const ART = [
  '<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="60" cy="45" r="12"/><circle cx="60" cy="45" r="25"/><circle cx="60" cy="45" r="38"/></g>',
  '<path d="M-10 100L60-10M10 100L80-10M30 100L100-10M50 100L120-10M70 100L140-10M90 100L160-10" stroke="currentColor" stroke-width="5"/>',
  '<circle cx="60" cy="45" r="32" fill="currentColor"/><rect x="60" y="0" width="60" height="90" fill="var(--card)"/>',
  '<defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3" fill="currentColor"/></pattern></defs><rect width="120" height="90" fill="url(#dots)"/>',
  '<path d="M0 25Q30 5 60 25T120 25M0 45Q30 25 60 45T120 45M0 65Q30 45 60 65T120 65" fill="none" stroke="currentColor" stroke-width="3.5"/>',
  '<rect x="18" y="14" width="52" height="52" fill="currentColor"/><rect x="48" y="30" width="52" height="52" fill="none" stroke="currentColor" stroke-width="3.5"/>',
];

export const Pic = ({ index = 0, img }) => html`
  <div class="im">${img
    ? html`<img src=${img} alt="" loading="lazy" />`
    : html`<svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: ART[index % ART.length] }} />`}
  </div>`;
