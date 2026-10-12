import { html } from '../lib/html.js';

/* A compact switch between a few screens (used for the Lab tools).
   One black thumb slides to the active option, so it reads as one small control instead of a tab strip.
   items: [{ id, label, href }]   index: which item is active
   Each option is a normal link, so the browser back button, keyboard and screen readers all work. */
export const Segmented = ({ items, index, label }) => html`
  <nav class="seg" aria-label=${label} style=${{ '--n': items.length, '--i': index }}>
    ${items.map((it, i) => html`<a key=${it.id} href=${it.href} aria-current=${i === index ? 'page' : undefined}>${it.label}</a>`)}
  </nav>`;
