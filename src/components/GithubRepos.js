import { html, useState, useEffect } from '../lib/html.js';
import { fetchRepos, timeAgo } from '../lib/github.js';
import { social } from '../data/site.js';

const SORTS = {
  updated: (a, b) => new Date(b.updated) - new Date(a.updated),
  stars: (a, b) => b.stars - a.stars || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
};

/* Your public GitHub repositories, loaded live in the visitor's browser (no backend) */
export function GithubRepos() {
  const gh = social.find(s => s.icon === 'gh');
  const [state, setState] = useState({ status: 'loading', repos: [], message: '' });
  const [sort, setSort] = useState('updated');
  const [lang, setLang] = useState('All');

  useEffect(() => {
    if (!gh) return;
    let live = true;
    fetchRepos(gh.handle)
      .then(repos => live && setState({ status: 'ok', repos, message: '' }))
      .catch(err => live && setState({ status: 'error', repos: [], message: err.message }));
    return () => { live = false; };
  }, []);

  if (!gh) return null;
  const { status, repos, message } = state;
  const langs = ['All', ...new Set(repos.map(r => r.language).filter(Boolean))];
  const shown = repos.filter(r => lang === 'All' || r.language === lang).sort(SORTS[sort]);

  return html`
    <div class="repos">
      <div class="ctl">
        <div class="tabs" role="group" aria-label="Filter by language" style=${{ margin: 0 }}>${langs.map(l => html`<button key=${l} className=${l === lang ? 'on' : ''} aria-pressed=${l === lang} onClick=${() => setLang(l)}>${l}</button>`)}</div>
        <label class="sel">Sort by
          <select value=${sort} onChange=${e => setSort(e.target.value)}><option value="updated">Recently updated</option><option value="stars">Stars</option><option value="name">Name</option></select>
        </label>
      </div>
      ${status === 'loading' && html`<p class="note">Loading repositories from GitHub...</p>`}
      ${status === 'error' && html`<p class="note">${message} <a href=${gh.href} target="_blank" rel="noopener">Open GitHub</a></p>`}
      ${status === 'ok' && shown.length === 0 && html`<p class="note">No public repositories to show yet.</p>`}
      ${shown.map(r => html`
        <a class="repo" key=${r.name} href=${r.url} target="_blank" rel="noopener">
          <h3>${r.name}</h3>
          <span class="meta2">${r.language || 'Text'}${r.stars > 0 ? ` · ★ ${r.stars}` : ''} · updated ${timeAgo(r.updated)}</span>
          <p>${r.description || 'No description.'}</p>
        </a>`)}
    </div>`;
}
