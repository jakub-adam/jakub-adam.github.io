/* Everything the command palette (Ctrl K) can do. Built from your data, so new pages,
   projects and posts show up automatically. */
import { site, social, pages, projects, posts, labTools } from '../data/site.js';
import { navigate } from './router.js';
import { toggleTheme, getTheme } from './theme.js';
import { copy } from './toast.js';

const open = url => window.open(url, '_blank', 'noopener');

export const buildItems = () => [
  ...pages.map(([label, id]) => ({ group: 'Go to', label, hint: '#/' + id, run: () => navigate(id) })),
  ...labTools.map(([id, label, , tag]) => ({ group: 'Lab', label, hint: tag || 'interactive tool', run: () => navigate('lab', id) })),
  { group: 'Actions', label: `Switch to ${getTheme() === 'dark' ? 'light' : 'dark'} theme`, hint: 'theme', run: toggleTheme },
  { group: 'Actions', label: 'Copy email', hint: site.email.text, run: () => copy(site.email.text, 'email') },
  { group: 'Actions', label: 'Copy phone', hint: site.phone.text, run: () => copy(site.phone.text.replace(/\s/g, ''), 'phone number') },
  ...projects.map(p => ({ group: 'Projects', label: p.title, hint: p.category, run: () => navigate('portfolio', p.slug) })),
  ...posts.map(p => ({ group: 'News', label: p.title, hint: p.date, run: () => navigate('news', p.slug) })),
  { group: 'Contact', label: 'Call ' + site.phone.text, hint: 'phone', run: () => { location.href = site.phone.href; } },
  ...social.filter(s => s.href).map(s => ({ group: 'Contact', label: s.name, hint: s.handle || 'open', run: () => open(s.href) })),
];
