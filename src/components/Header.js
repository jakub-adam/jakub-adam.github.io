import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { site, pages } from '../data/site.js';
import { link } from '../lib/router.js';
import { toggleTheme } from '../lib/theme.js';

const mac = /Mac|iPhone|iPad/.test(navigator.platform);

/* Fixed at the very top of the content column. On a wide screen the pages are listed right in it,
   with a line under the current one. On narrower screens the list folds into the menu button,
   and on phones it becomes a compact app bar (the pages move to the tab bar at the bottom).
   The assistant shortcut is hidden while the assistant is already open, so its icon is never shown twice. */
export const Header = ({ page, menuOpen, onMenu, onSearch, onAssistant }) => html`
  <header>
    <a class="logo" href=${link('home')}>${site.name}</a>
    <nav class="hnav" aria-label="Pages">
      ${pages.filter(p => p[2] !== false).map(([label, id]) => html`
        <a key=${id} href=${link(id)} aria-current=${page === id ? 'page' : undefined}>${label}</a>`)}
    </nav>
    <div class="tools">
      <button class="kbtn" data-search-anchor onClick=${onSearch} aria-label="Search the site"><${Icon} name="search" /><span>Search</span><span class="keys"><kbd>${mac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd></span></button>
      <button class="kbtn ibtn tbtn" data-magnet onClick=${toggleTheme} aria-label="Switch between dark and light theme"><span class="i-sun"><${Icon} name="sun" /></span><span class="i-moon"><${Icon} name="moon" /></span></button>
      ${!onAssistant && html`<a class="kbtn ibtn aibtn" data-magnet href=${link('lab', 'assistant')} aria-label="Ask Jakub, the AI assistant"><${Icon} name="chat" /></a>`}
      <button class=${'burger' + (menuOpen ? ' open' : '')} onClick=${onMenu} aria-label=${menuOpen ? 'Close menu' : 'Open menu'} aria-expanded=${menuOpen}><i></i><i></i><i></i></button>
    </div>
  </header>`;
