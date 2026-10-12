import { reduceMotion } from './motion.js';

export const getTheme = () => document.documentElement.getAttribute('data-theme');

/* Switches theme with a soft cross-fade where the browser supports it */
export function setTheme(next) {
  const apply = () => {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  };
  if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply); else apply();
}
export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');
