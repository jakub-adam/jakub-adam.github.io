import { html, useState, useEffect, Fragment } from './lib/html.js';
import { useRoute } from './lib/router.js';
import { reduceMotion } from './lib/motion.js';
import { pages } from './data/site.js';
import { Panel } from './components/Panel.js';
import { Header } from './components/Header.js';
import { Menu } from './components/Menu.js';
import { TabBar } from './components/TabBar.js';
import { CommandPalette } from './components/CommandPalette.js';
import { Rail } from './components/Rail.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { Portfolio } from './pages/Portfolio.js';
import { Lab } from './pages/Lab.js';
import { About } from './pages/About.js';
import { News } from './pages/News.js';
import { Contact } from './pages/Contact.js';

/* To add a page: create it in src/pages, import it here, add it to "screens"
   and to the "pages" list in src/data/site.js.
   Sub screens (#/portfolio/<slug>, #/news/<slug>, #/lab/<tool>) are handled by the page itself:
   Portfolio opens ProjectDetail as a sheet over the list, News shows PostDetail next to it. */
const screens = { home: Home, portfolio: Portfolio, lab: Lab, about: About, news: News, contact: Contact };

export function App() {
  const { page, id } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [palOpen, setPalOpen] = useState(false);
  const current = screens[page] ? page : 'home';
  const View = screens[current];
  const onAssistant = current === 'lab' && (!id || id === 'assistant');   // the Lab opens on Ask Jakub when no tool is named

  useEffect(() => {                                       // title and menu follow the route
    const label = pages.find(p => p[1] === current)[0];
    document.title = (current === 'home' ? '' : label + ' | ') + 'Jakub Adam';
    document.documentElement.dataset.page = current;      // lets the CSS react to the page
    setMenuOpen(false);
  }, [current, id]);

  useEffect(() => {                                       // Ctrl K / Cmd K or "/" opens the palette
    const onKey = e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalOpen(o => !o); setMenuOpen(false); }
      else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setPalOpen(true); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {                                       // anything marked data-magnet leans a few pixels toward the cursor
    if (reduceMotion || !matchMedia('(hover: hover)').matches) return;
    let held = null;
    const release = () => { if (held) held.style.translate = ''; held = null; };
    const onMove = e => {
      const el = e.target.closest ? e.target.closest('[data-magnet]') : null;
      if (el !== held) release();
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 6}px ${((e.clientY - r.top) / r.height - 0.5) * 6}px`;
      held = el;
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); release(); };
  }, []);

  useEffect(() => {                                       // fade sections in as they scroll into view
    const items = [...document.querySelectorAll('.rv')];
    if (reduceMotion || !('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('in'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [current]);

  return html`<${Fragment}>
    <${Header} page=${current} onAssistant=${onAssistant} menuOpen=${menuOpen} onMenu=${() => setMenuOpen(o => !o)} onSearch=${() => { setMenuOpen(false); setPalOpen(true); }} />
    <${Panel} page=${current} />
    <div class="wrap">
      <main class="page" key=${current}><${View} id=${id} /></main>
      <${Footer} />
    </div>
    <${Rail} onAssistant=${onAssistant} />
    <${TabBar} page=${current} />
    <${Menu} open=${menuOpen} close=${() => setMenuOpen(false)} page=${current} />
    <${CommandPalette} open=${palOpen} close=${() => setPalOpen(false)} />
  <//>`;
}
