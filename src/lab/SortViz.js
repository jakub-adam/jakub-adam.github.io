import { html, useState, useEffect, useRef, Fragment } from '../lib/html.js';
import { ALGORITHMS, makeArray } from '../lib/sorting.js';

/* Each algorithm is a generator, so "step" just calls .next() and draws the frame it returns.
   Layout: one toolbar (algorithm, size, speed, buttons) and the bars fill whatever room is left,
   so nothing needs scrolling on a laptop or a phone. */
export function SortViz() {
  const [name, setName] = useState('Quick sort');
  const [size, setSize] = useState(40);
  const [speed, setSpeed] = useState(50);                 // 1 slow ... 100 fast
  const [frame, setFrame] = useState(() => ({ a: makeArray(40), hl: [], cmp: 0, swp: 0 }));
  const [status, setStatus] = useState('idle');           // idle | running | paused | done
  const gen = useRef(null), stats = useRef(null), current = useRef(frame);

  const show = f => { current.current = f; setFrame(f); };
  const reset = () => { gen.current = null; setStatus('idle'); show({ a: makeArray(size), hl: [], cmp: 0, swp: 0 }); };
  useEffect(reset, [size, name]);

  const step = () => {
    if (!gen.current) { stats.current = { cmp: 0, swp: 0 }; gen.current = ALGORITHMS[name].run(current.current.a.slice(), stats.current); }
    const r = gen.current.next();
    if (r.done) { show({ a: [...current.current.a].sort((x, y) => x - y), hl: [], ...stats.current }); setStatus('done'); }
    else show(r.value);
  };

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(step, Math.max(2, Math.round(600 / speed)));
    return () => clearInterval(id);
  }, [status, speed, name]);

  const running = status === 'running';
  return html`<${Fragment}>
    <div class="svbar">
      <label class="sel s-alg">Algorithm
        <select value=${name} onChange=${e => setName(e.target.value)}>${Object.keys(ALGORITHMS).map(n => html`<option key=${n}>${n}</option>`)}</select></label>
      <label class="sel">Items: ${size}<input type="range" min="10" max="90" value=${size} onChange=${e => setSize(+e.target.value)} /></label>
      <label class="sel">Speed<input type="range" min="1" max="100" value=${speed} onChange=${e => setSpeed(+e.target.value)} /></label>
      <div class="s-btns">
        <button class="btn sm" disabled=${status === 'done'} onClick=${() => setStatus(running ? 'paused' : 'running')}>${running ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}</button>
        <button class="btn sm ghost" disabled=${running || status === 'done'} onClick=${() => { step(); setStatus(s => (s === 'idle' ? 'paused' : s)); }}>Step</button>
        <button class="btn sm ghost" onClick=${reset}>Shuffle</button>
      </div>
    </div>
    <div class=${'bars' + (status === 'done' ? ' done' : '')} aria-label="Sorting animation" role="img">
      ${frame.a.map((v, i) => html`<i key=${i} class=${frame.hl.includes(i) ? 'hl' : ''} style=${{ height: (v / size) * 100 + '%' }}></i>`)}
    </div>
    <p class="note stat">${name}: ${ALGORITHMS[name].big} on average. Comparisons ${frame.cmp}, swaps or writes ${frame.swp}. ${status === 'done' ? 'Sorted.' : ''}</p>
  <//>`;
}
