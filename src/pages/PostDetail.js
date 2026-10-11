import { html, Fragment } from '../lib/html.js';
import { Pic } from '../components/Pic.js';
import { posts } from '../data/site.js';
import { link } from '../lib/router.js';

export function PostDetail({ id }) {
  const index = posts.findIndex(p => p.slug === id);
  const p = posts[index];
  if (!p) return html`<${Fragment}><a class="back" href=${link('news')}>Back to news</a><h1 class="title">Post not found</h1><//>`;
  return html`<${Fragment}>
    <a class="back" href=${link('news')}>Back to news</a>
    <h1 class="title">${p.title}</h1>
    <p class="meta">${p.date}</p>
    <div class="wide"><${Pic} index=${index + 2} img=${p.img} /></div>
    <div class="prose">${p.body.map((t, i) => html`<p key=${i}>${t}</p>`)}</div>
  <//>`;
}
