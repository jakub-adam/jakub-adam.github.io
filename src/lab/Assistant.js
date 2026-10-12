import { html, useState, useEffect, useRef, Fragment } from '../lib/html.js';
import { answer, resetAssistant, STARTERS } from '../lib/assistant.js';
import { assistant } from '../data/site.js';
import { Icon } from '../components/Icon.js';
import { SampleTag } from '../components/SampleTag.js';

const greeting = () => ({ id: 0, role: 'bot', text: assistant.greeting, sample: false, actions: [], suggestions: STARTERS, animate: false });
let saved = null; // the conversation survives page changes while the site stays open
let counter = 1;
const mouse = () => matchMedia('(hover: hover) and (pointer: fine)').matches; // do not pop the phone keyboard open by itself

/* Reveals the answer word by word, like a streamed reply.
   The sparkle icon appears once, in the chat header, so messages carry no avatar. */
function BotMessage({ m, onTick, onDone }) {
  const parts = m.text.split(/(\s+)/);
  const [shown, setShown] = useState(m.animate ? 0 : parts.length);
  const done = shown >= parts.length;

  useEffect(() => {
    if (!m.animate || done) return;
    const id = setInterval(() => setShown(n => n + 2), 24);
    return () => clearInterval(id);
  }, [done]);
  useEffect(() => { onTick(); if (done && m.animate) onDone(m.id); }, [shown]);

  return html`
    <div class="msg bot">
      <div class="bub">
        <p class="bt">${parts.slice(0, shown).join('')}</p>
        ${done && m.sample && html`<p class="snote"><${SampleTag} /> This is placeholder content from the site, not real details about Jakub yet.</p>`}
        ${done && m.actions.length > 0 && html`<div class="chips">${m.actions.map(a => html`
          <a key=${a.label} class="chip-link" href=${a.hash || a.href} ...${a.href && a.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}}>${a.label}</a>`)}</div>`}
      </div>
    </div>`;
}

export function Assistant() {
  const [msgs, setMsgs] = useState(() => (saved ? saved.map(m => ({ ...m, animate: false })) : [greeting()]));
  const [thinking, setThinking] = useState(false);
  const [text, setText] = useState('');
  const list = useRef(null), field = useRef(null);

  useEffect(() => { saved = msgs; }, [msgs]);
  const toBottom = () => { if (list.current) list.current.scrollTop = list.current.scrollHeight; };
  useEffect(toBottom, [msgs, thinking]);
  useEffect(() => { if (mouse() && field.current) field.current.focus({ preventScroll: true }); }, []);

  const send = question => {
    const q = question.trim();
    if (!q || thinking) return;
    setText('');
    setMsgs(m => [...m, { id: counter++, role: 'user', text: q }]);
    setThinking(true);
    if (mouse() && field.current) field.current.focus({ preventScroll: true });
    setTimeout(() => {                                        // a short pause so it feels like it is reading the question
      const r = answer(q);
      setMsgs(m => [...m, { ...r, topic: r.id, id: counter++, role: 'bot', animate: true }]);   // r.id is the topic, so the unique message id must come last
      setThinking(false);
    }, 450 + Math.min(q.length * 8, 450));
  };
  const clear = () => { saved = null; resetAssistant(); setThinking(false); setMsgs([greeting()]); };

  const last = [...msgs].reverse().find(m => m.role === 'bot');
  const chips = last && last.suggestions ? last.suggestions : STARTERS;

  return html`<${Fragment}>
    <div class="chat">
      <div class="chat-head">
        <span class="av"><${Icon} name="spark" /></span>
        <div><b>${assistant.name}</b><small>Answers come only from the details on this site. It is not a general AI.</small></div>
        <button class="btn sm ghost" onClick=${clear}>Clear</button>
      </div>
      <div class="chat-list" ref=${list} aria-live="polite">
        ${msgs.map(m => m.role === 'user'
          ? html`<div class="msg user" key=${m.id}><div class="bub"><p class="bt">${m.text}</p></div></div>`
          : html`<${BotMessage} key=${m.id} m=${m} onTick=${toBottom} onDone=${() => {}} />`)}
        ${thinking && html`<div class="msg bot"><div class="bub"><div class="dots"><i></i><i></i><i></i></div></div></div>`}
      </div>
      <div class="chips">${chips.map(s => html`<button key=${s} onClick=${() => send(s)} disabled=${thinking}>${s}</button>`)}</div>
      <div class="chat-form">
        <input ref=${field} class="chat-in" value=${text} placeholder="Ask something about Jakub..." aria-label="Your question" maxLength="200" autoComplete="off"
          onChange=${e => setText(e.target.value)} onKeyDown=${e => e.key === 'Enter' && send(text)} />
        <button class="send" onClick=${() => send(text)} disabled=${thinking || !text.trim()} aria-label="Send"><${Icon} name="arrow" /></button>
      </div>
    </div>
  <//>`;
}
