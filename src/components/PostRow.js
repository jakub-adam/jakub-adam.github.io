import { html } from '../lib/html.js';
import { link } from '../lib/router.js';

/* One line of the journal: the date and the title. "on" marks the entry that is open. */
export const PostRow = ({ post, on }) => html`
  <li>
    <a class="jrow" href=${link('news', post.slug)} aria-current=${on ? 'true' : undefined}>
      <span class="jdate"><i class="dot"></i>${post.date}</span>
      <span class="jtitle">${post.title}</span>
    </a>
  </li>`;
