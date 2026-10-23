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
import { ProjectDetail } from './pages/ProjectDetail.js';
import { Lab } from './pages/Lab.js';
import { About } from './pages/About.js';
import { News } from './pages/News.js';
import { PostDetail } from './pages/PostDetail.js';
import { Contact } from './pages/Contact.js';

/* To add a page: create it in src/pages, import it here, add it to "screens"
   and to the "pages" list in src/data/site.js. */
const screens = { home: Home, portfolio: Portfolio, lab: Lab, about: About, news: News, contact: Contact };
const details = { portfolio: ProjectDetail, news: PostDetail }; // pages whose sub screens remount the page

export function App() {
  const { page, id } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [palOpen, setPalOpen] = useState(false);
  const current = screens[page] ? page : 'home';
  const View = id && details[current] ? details[current] : screens[current];
  const onAssistant = current === 'lab' && (!id || id === 'assistant');   // the Lab opens on Ask Jakub when no tool is named

  useEffect(() => {                                       // title and menu follow the route
    const label = pages.find(p => p[1] === current)[0];
    document.title = (current === 'home' ? '' : label + ' | ') + 'Jakub Adam';
    document.documentElement.dataset.page = current;      // lets the CSS react to the page (the Contact page collapses the side bar)
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

  useEffect(() => {                                       // fade sections in as they scroll into view
    const items = [...document.querySelectorAll('.rv')];
    if (reduceMotion || !('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('in'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [current, id]);

  return html`<${Fragment}>
    <${Header} onAssistant=${onAssistant} menuOpen=${menuOpen} onMenu=${() => setMenuOpen(o => !o)} onSearch=${() => { setMenuOpen(false); setPalOpen(true); }} />
    <${Panel} page=${current} />
    <div class="wrap">
      <main class="page" key=${current + (details[current] ? id : '')}><${View} id=${id} /></main>
    </div>
    <${Rail} onAssistant=${onAssistant} />
    <${Footer} />
    <${TabBar} page=${current} />
    <${Menu} open=${menuOpen} close=${() => setMenuOpen(false)} page=${current} />
    <${CommandPalette} open=${palOpen} close=${() => setPalOpen(false)} />
  <//>`;
}
