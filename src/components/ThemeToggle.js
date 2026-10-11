import { html } from '../lib/html.js';
import { Icon } from './Icon.js';

export function ThemeToggle() {
  const flip = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  };
  return html`
    <button class="sw" onClick=${flip} aria-label="Switch between dark and light theme">
      <em class="dk"><${Icon} name="moon" />Dark</em><span class="pill"></span><em class="lt"><${Icon} name="sun" />Light</em>
    </button>`;
}
