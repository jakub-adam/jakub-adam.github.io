import { html, useState, useEffect, useRef, Fragment } from '../lib/html.js';
import { run, complete } from '../lib/commands.js';
import { navigate } from '../lib/router.js';
import { setTheme } from '../lib/theme.js';

const PROMPT = 'visitor@jakubadam:~$';
const BANNER = ['jakubadam.com terminal', 'Type "help" to list the commands. Try: neofetch, skills, ls projects, open portfolio', ''];
const QUICK = ['help', 'neofetch', 'skills', 'ls projects', 'open portfolio', 'clear'];   // tap-to-run shortcuts (handy on a phone keyboard)

/* A small shell: history (arrow keys), Tab completion, quoted arguments, a virtual file system */
export function Terminal() {
  const [lines, setLines] = useState(() => BANNER.map(text => ({ kind: 'out', text })));
  const [value, setValue] = useState('');
  const history = useRef([]), pos = useRef(0), box = useRef(null), input = useRef(null);

  useEffect(() => { box.current.scrollTop = box.current.scrollHeight; }, [lines]);

  const print = (...rows) => setLines(l => [...l, ...rows]);
  const submit = (line = value) => {
    if (line.trim()) history.current.push(line);
    pos.current = history.current.length;
    const out = run(line, { navigate, setTheme, history: history.current });
    setValue('');
    if (out && out.clear) return setLines([]);
    const rows = (Array.isArray(out) ? out : [out]).flatMap(t => String(t).split('\n'));
    print({ kind: 'in', text: line }, ...rows.map(text => ({ kind: 'out', text })));
  };
  const onKey = e => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (pos.current > 0) setValue(history.current[--pos.current]); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pos.current < history.current.length - 1) setValue(history.current[++pos.current]);
      else { pos.current = history.current.length; setValue(''); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const r = complete(value);
      if (r.options.length) print({ kind: 'in', text: value }, { kind: 'out', text: r.options.join('  ') });
      setValue(r.line);
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
  };

  return html`<${Fragment}>
    <div class="term" ref=${box} onClick=${() => input.current.focus()}>
      ${lines.map((l, i) => html`<div key=${i} class=${'tl ' + l.kind}>${l.kind === 'in' && html`<span class="ps">${PROMPT} </span>`}${l.text}</div>`)}
      <label class="tl live"><span class="ps">${PROMPT}</span>
        <input ref=${input} value=${value} onChange=${e => setValue(e.target.value)} onKeyDown=${onKey}
          spellCheck="false" autoComplete="off" autoCapitalize="off" aria-label="Terminal input" /></label>
    </div>
    <div class="chips quick" role="group" aria-label="Quick commands">${QUICK.map(c => html`<button key=${c} onClick=${() => submit(c)}>${c}</button>`)}</div>
  <//>`;
}
