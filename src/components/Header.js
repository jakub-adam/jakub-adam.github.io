import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { site } from '../data/site.js';
import { link } from '../lib/router.js';
import { toggleTheme } from '../lib/theme.js';

const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';

/* Fixed at the very top. On phones it becomes a compact app bar: logo mark, search,
   theme and the assistant. The menu button is for larger screens only.
   The assistant shortcut is hidden while the assistant is already open, so its icon is never shown twice. */
export const Header = ({ menuOpen, onMenu, onSearch, onAssistant }) => html`
  <header>
    <a class="logo" href=${link('home')}>${site.name}</a>
    <div class="tools">
      <button class="kbtn" data-search-anchor onClick=${onSearch} aria-label="Search the site"><${Icon} name="search" /><span>Search</span><kbd>${shortcut}</kbd></button>
      <button class="kbtn tbtn" onClick=${toggleTheme} aria-label="Switch between dark and light theme"><span class="i-sun"><${Icon} name="sun" /></span><span class="i-moon"><${Icon} name="moon" /></span></button>
      ${!onAssistant && html`<a class="kbtn aibtn" href=${link('lab', 'assistant')} aria-label="Ask Jakub, the AI assistant"><${Icon} name="chat" /></a>`}
      <button class=${'burger' + (menuOpen ? ' open' : '')} onClick=${onMenu} aria-label=${menuOpen ? 'Close menu' : 'Open menu'} aria-expanded=${menuOpen}><i></i><i></i><i></i></button>
    </div>
  </header>`;
