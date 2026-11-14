import { html, useEffect } from '../lib/html.js';
import { PostRow } from '../components/PostRow.js';
import { SampleTag } from '../components/SampleTag.js';
import { PostDetail } from './PostDetail.js';
import { posts } from '../data/site.js';
import { navigate } from '../lib/router.js';

/* The news page is a journal: every entry on the left, the one you picked on the right.
   #/news shows the newest entry, #/news/<slug> a specific one. J and K step through them.
   On a phone the list and the entry are separate screens (see .journal in global.css). */
export function News({ id }) {
  const found = posts.findIndex(p => p.slug === id);
  const index = found < 0 ? 0 : found;

  useEffect(() => {
    const onKey = e => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      const step = e.key === 'j' ? 1 : e.key === 'k' ? -1 : 0;
      const next = posts[index + step];
      if (step && next) navigate('news', next.slug);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [index]);

  return html`<div class="journal" data-open=${id ? 'true' : 'false'}>
    <div class="phead">
      <div>
        <h1 class="title">News</h1>
        <p class="intro">A short journal. What changed, what I am building, what I learned.</p>
      </div>
      <div class="phead-side"><span class="count">${posts.length} entries${posts.every(p => p.sample) && html`<${SampleTag} />`}</span></div>
    </div>
    <div class="jgrid">
      <ol class="jlist">${posts.map((p, i) => html`<${PostRow} key=${p.slug} post=${p} on=${i === index} />`)}</ol>
      <${PostDetail} key=${id && found < 0 ? 'missing' : posts[index].slug} id=${id && found < 0 ? id : posts[index].slug} />
    </div>
  </div>`;
}
