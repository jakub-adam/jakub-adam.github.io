import { html } from '../lib/html.js';
import { Pic } from './Pic.js';
import { link } from '../lib/router.js';

export const PostRow = ({ post, index }) => html`
  <article class="post">
    <${Pic} index=${index + 2} img=${post.img} />
    <div><h3>${post.title}</h3><p>${post.excerpt}</p><a class="btn" href=${link('news', post.slug)}>Read more</a></div>
  </article>`;
