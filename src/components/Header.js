import { html } from '../lib/html.js';
import { site } from '../data/site.js';
import { link } from '../lib/router.js';

export const Header = ({ onMenu }) => html`
  <header>
    <a class="logo" href=${link('home')}>${site.name}</a>
    <button class="burger" onClick=${onMenu} aria-label="Open menu"><i></i><i></i><i></i></button>
  </header>`;
