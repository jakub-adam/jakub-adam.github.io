import { html } from '../lib/html.js';

/* Six generated black-and-white patterns, used when a project or post has no image */
const ART = [
  '<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="60" cy="45" r="12"/><circle cx="60" cy="45" r="25"/><circle cx="60" cy="45" r="38"/></g>',
  '<path d="M-10 100L60-10M10 100L80-10M30 100L100-10M50 100L120-10M70 100L140-10M90 100L160-10" stroke="currentColor" stroke-width="5"/>',
  '<circle cx="60" cy="45" r="32" fill="currentColor"/><rect x="60" y="0" width="60" height="90" fill="var(--card)"/>',
  '<defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3" fill="currentColor"/></pattern></defs><rect width="120" height="90" fill="url(#dots)"/>',
  '<path d="M0 25Q30 5 60 25T120 25M0 45Q30 25 60 45T120 45M0 65Q30 45 60 65T120 65" fill="none" stroke="currentColor" stroke-width="3.5"/>',
  '<rect x="18" y="14" width="52" height="52" fill="currentColor"/><rect x="48" y="30" width="52" height="52" fill="none" stroke="currentColor" stroke-width="3.5"/>',
];

/* Hand-drawn schematics for a project, picked with  art: '<name>'  in src/data/site.js.
   Each one is a small drawing of a screen with a label and a note, shown on the project sheet;
   the first is also the preview that appears when you hover the project's row.
   They use the project's own colors, so they stay the same in the light and the dark theme. */
const week = '<g fill="var(--line-2)"><rect x="24" y="20" width="24" height="24" rx="6"/><rect x="56" y="20" width="24" height="24" rx="6"/><rect x="88" y="20" width="24" height="24" rx="6"/><rect x="120" y="20" width="24" height="24" rx="6"/><rect x="152" y="20" width="24" height="24" rx="6"/><rect x="216" y="20" width="24" height="24" rx="6"/></g><rect x="184" y="20" width="24" height="24" rx="6" fill="#2F5BFF"/>';
const SCHEMATICS = {
  prime: [
    { label: 'Today', note: 'Rings · week strip', alt: 'Schematic of the Today screen: a week strip and three activity rings',
      svg: week + '<g fill="none" stroke-width="8" stroke-linecap="round"><circle cx="78" cy="108" r="40" stroke="var(--line-2)"/><circle cx="78" cy="108" r="28" stroke="var(--line-2)"/><circle cx="78" cy="108" r="16" stroke="var(--line-2)"/><path d="M78 68A40 40 0 1 1 40 120" stroke="#D6456B"/><path d="M78 80A28 28 0 1 1 50 108" stroke="#3F8A5C"/><path d="M78 92A16 16 0 0 1 78 124" stroke="#2F5BFF"/></g><g fill="currentColor"><rect x="150" y="78" width="64" height="8" rx="4"/><rect x="150" y="98" width="96" height="6" rx="3" opacity=".2"/><rect x="150" y="114" width="80" height="6" rx="3" opacity=".2"/><rect x="150" y="130" width="88" height="6" rx="3" opacity=".2"/></g>' },
    { label: 'Activity', note: 'Route by pace', alt: 'Schematic of a workout page: a running route coloured by pace',
      svg: '<path d="M0 56H280M0 112H280M70 0V170M140 0V170M210 0V170" fill="none" stroke="var(--line-2)"/><g fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M34 128C52 96 70 110 88 84C100 66 118 70 128 52" stroke="#2F5BFF"/><path d="M128 52C142 30 170 34 182 54C190 68 206 66 214 80" stroke="#3F8A5C"/><path d="M214 80C224 98 244 96 248 116C250 130 236 140 222 138" stroke="#C98A1E"/></g><circle cx="34" cy="128" r="5" fill="var(--card)" stroke="currentColor" stroke-width="2"/><circle cx="222" cy="138" r="5" fill="currentColor"/>' },
    { label: 'Sleep', note: 'Awake · REM · Core · Deep', alt: 'Schematic of the Sleep page: a night drawn as blocks across four stages',
      svg: '<path d="M24 40H256M24 72H256M24 104H256M24 136H256" fill="none" stroke="var(--line-2)"/><rect x="24" y="32" width="10" height="16" rx="3" fill="#B8935A"/><rect x="34" y="96" width="34" height="16" rx="3" fill="#5651D6"/><rect x="68" y="128" width="30" height="16" rx="3" fill="#36329A"/><rect x="98" y="96" width="22" height="16" rx="3" fill="#5651D6"/><rect x="120" y="64" width="24" height="16" rx="3" fill="#9E9BF0"/><rect x="144" y="96" width="30" height="16" rx="3" fill="#5651D6"/><rect x="174" y="128" width="18" height="16" rx="3" fill="#36329A"/><rect x="192" y="32" width="6" height="16" rx="3" fill="#B8935A"/><rect x="198" y="96" width="20" height="16" rx="3" fill="#5651D6"/><rect x="218" y="64" width="38" height="16" rx="3" fill="#9E9BF0"/>' },
  ],
};

export const schematics = name => SCHEMATICS[name] || null;

/* One schematic screen with its caption */
export const Schematic = ({ part }) => html`
  <figure class="shot">
    <svg viewBox="0 0 280 170" role="img" aria-label=${part.alt} dangerouslySetInnerHTML=${{ __html: part.svg }} />
    <figcaption><b>${part.label}</b><span>${part.note}</span></figcaption>
  </figure>`;

/* index picks the pattern; img (optional) is a path like 'images/shot.jpg'; art (optional) is a schematic name */
export const Pic = ({ index = 0, img, art }) => {
  const drawn = schematics(art);
  return html`
    <div class="im">${img
      ? html`<img src=${img} alt="" loading="lazy" />`
      : drawn
        ? html`<svg viewBox="0 0 280 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: drawn[0].svg }} />`
        : html`<svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: ART[index % ART.length] }} />`}
    </div>`;
};
