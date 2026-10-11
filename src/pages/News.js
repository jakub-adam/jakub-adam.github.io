import { html, useState, Fragment } from '../lib/html.js';
import { PostRow } from '../components/PostRow.js';
import { posts } from '../data/site.js';

export function News() {
  const [shown, setShown] = useState(3);
  return html`<${Fragment}>
    <h1 class="title">News</h1>
    <div>${posts.slice(0, shown).map((p, i) => html`<${PostRow} key=${p.slug} post=${p} index=${i} />`)}</div>
    ${shown < posts.length && html`<button class="more" onClick=${() => setShown(shown + 3)}>Load more</button>`}
  <//>`;
}
