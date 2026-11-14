import { html, useState, useEffect, useRef, useMemo } from '../lib/html.js';
import { fuzzy } from '../lib/fuzzy.js';
import { buildItems } from '../lib/palette.js';
import { Icon } from './Icon.js';

/* Underlines the letters that matched what you typed */
const Highlight = ({ text, hits }) => html`<span>${[...text].map((c, i) => (hits && hits.includes(i) ? html`<mark key=${i}>${c}</mark>` : c))}</span>`;

/* Ctrl K / Cmd K (or "/"): jump to any page, tool, project, post or link from the keyboard,
   switch the theme, or copy the email and the phone number. A panel in the middle of the screen
   on a computer, a sheet from the bottom on a phone (see global.css). */
export function CommandPalette({ open, close }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null), list = useRef(null);
  const all = useMemo(buildItems, [open]);                // rebuilt each time, so "Switch to ... theme" is right

  const q = query.trim();
  const results = q
    ? all.map(item => ({ item, m: fuzzy(q, item.label) })).filter(r => r.m).sort((a, b) => b.m.score - a.m.score).slice(0, 9)
    : all.map(item => ({ item, m: null }));

  useEffect(() => {
    if (!open) return;
    setQuery(''); setActive(0);
    const t = setTimeout(() => input.current && input.current.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {                                       // keep the highlighted row visible
    const row = list.current && list.current.querySelector('.on');
    if (row) row.scrollIntoView({ block: 'nearest' });
  }, [active, query]);

  const choose = i => { const r = results[i]; if (!r) return; close(); setTimeout(r.item.run, 60); };
  const onKey = e => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    else if (e.key === 'Tab') e.preventDefault();
  };

  let group = '';
  return html`
    <div class=${'pal-wrap' + (open ? ' open' : '')} onMouseDown=${e => e.target === e.currentTarget && close()} aria-hidden=${!open}>
      <div class="pal" role="dialog" aria-label="Command palette">
        <div class="pal-top">
          <${Icon} name="search" />
          <input ref=${input} class="pal-in" value=${query} placeholder="Type a command or search" aria-label="Search commands" tabIndex=${open ? 0 : -1}
            onChange=${e => { setQuery(e.target.value); setActive(0); }} onKeyDown=${onKey} spellcheck="false" autocomplete="off" />
          <kbd>Esc</kbd>
        </div>
        <div class="pal-list" ref=${list} role="listbox">
          ${results.length === 0 && html`<p class="pal-empty">Nothing matches "${q}"</p>`}
          ${results.map(({ item, m }, i) => {
            const head = !q && item.group !== group ? (group = item.group) : null;
            return html`<div key=${item.group + item.label}>
              ${head && html`<p class="pal-group">${head}</p>`}
              <div class=${'pi' + (i === active ? ' on' : '')} role="option" aria-selected=${i === active}
                onMouseMove=${() => active !== i && setActive(i)} onClick=${() => choose(i)}>
                <i class="dot"></i><${Highlight} text=${item.label} hits=${m && m.idx} /><small>${item.hint}</small><em class="ret">↵</em>
              </div>
            </div>`;
          })}
        </div>
        <p class="pal-foot"><span><span>↑↓ move</span><span>↵ open</span><span>esc close</span></span><span>${results.length} ${results.length === 1 ? 'result' : 'results'}</span></p>
      </div>
    </div>`;
}
