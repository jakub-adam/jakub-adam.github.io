import { html } from '../lib/html.js';
import { Pic } from '../components/Pic.js';
import { Icon } from '../components/Icon.js';
import { SampleTag } from '../components/SampleTag.js';
import { posts } from '../data/site.js';
import { link } from '../lib/router.js';

const two = n => String(n).padStart(2, '0');

/* Sub screen: #/news/<slug>. The reader beside the journal list (its own screen on a phone). */
export function PostDetail({ id }) {
  const index = posts.findIndex(p => p.slug === id);
  const p = posts[index], next = posts[index + 1];
  if (!p) return html`<article class="reader"><a class="back" href=${link('news')}>Back to news</a><h2 class="reader-title">Post not found</h2></article>`;
  return html`
    <article class="reader">
      <a class="back" href=${link('news')}>Back to news</a>
      <p class="reader-meta"><span>Entry ${two(index + 1)} of ${two(posts.length)} · ${p.date}</span><span class="reader-keys"><kbd>J</kbd><kbd>K</kbd> to move</span></p>
      <h2 class="reader-title">${p.title}${p.sample && html`<${SampleTag} />`}</h2>
      ${p.img && html`<div class="wide"><${Pic} index=${index + 2} img=${p.img} /></div>`}
      <div class="prose">${p.body.map((t, i) => html`<p key=${i}>${t}</p>`)}</div>
      ${next && html`<a class="reader-next" href=${link('news', next.slug)}>
        <span><small>Next entry</small><b>${next.title}</b></span><${Icon} name="arrow" />
      </a>`}
    </article>`;
}
