import { html } from '../lib/html.js';
import { Icon } from './Icon.js';
import { toggleTheme } from '../lib/theme.js';

/* Dark / Light switch. The choice is saved in the browser. */
export const ThemeToggle = () => html`
  <button class="sw" onClick=${toggleTheme} aria-label="Switch between dark and light theme">
    <em class="dk"><${Icon} name="moon" />Dark</em><span class="pill"></span><em class="lt"><${Icon} name="sun" />Light</em>
  </button>`;
