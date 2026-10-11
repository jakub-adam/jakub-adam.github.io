import { html, useState, useEffect, Fragment } from './lib/html.js';
import { useRoute } from './lib/router.js';
import { pages } from './data/site.js';
import { Panel } from './components/Panel.js';
import { Header } from './components/Header.js';
import { Menu } from './components/Menu.js';
import { SocialRail } from './components/SocialRail.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { Portfolio } from './pages/Portfolio.js';
import { ProjectDetail } from './pages/ProjectDetail.js';
import { About } from './pages/About.js';
import { News } from './pages/News.js';
import { PostDetail } from './pages/PostDetail.js';
import { Contact } from './pages/Contact.js';

const screens = { home: Home, portfolio: Portfolio, about: About, news: News, contact: Contact };
const details = { portfolio: ProjectDetail, news: PostDetail }; // pages that have sub screens

export function App() {
  const { page, id } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = screens[page] ? page : 'home';
  const View = id && details[current] ? details[current] : screens[current];

  useEffect(() => {
    const label = pages.find(p => p[1] === current)[0];
    document.title = (current === 'home' ? '' : label + ' | ') + 'Jakub Adam';
  }, [current]);

  return html`<${Fragment}>
    <${Panel} />
    <div class="wrap">
      <${Header} onMenu=${() => setMenuOpen(true)} />
      <main class="page" key=${current + id}><${View} id=${id} /></main>
      <${Footer} />
    </div>
    <${SocialRail} />
    <${Menu} open=${menuOpen} close=${() => setMenuOpen(false)} page=${current} />
  <//>`;
}
