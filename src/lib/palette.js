/* Everything the command palette (Ctrl K) can do. Built from your data, so new pages,
   projects and posts show up automatically. */
import { site, social, pages, projects, posts, labTools } from '../data/site.js';
import { navigate } from './router.js';
import { toggleTheme } from './theme.js';

const open = url => window.open(url, '_blank', 'noopener');

export const buildItems = () => [
  ...pages.map(([label, id]) => ({ group: 'Pages', label, hint: '#/' + id, run: () => navigate(id) })),
  ...labTools.map(([id, label]) => ({ group: 'Lab', label, hint: 'interactive tool', run: () => navigate('lab', id) })),
  ...projects.map(p => ({ group: 'Projects', label: p.title, hint: p.category, run: () => navigate('portfolio', p.slug) })),
  ...posts.map(p => ({ group: 'News', label: p.title, hint: p.date, run: () => navigate('news', p.slug) })),
  { group: 'Contact', label: 'Call ' + site.phone.text, hint: 'phone', run: () => { location.href = site.phone.href; } },
  ...social.filter(s => s.href).map(s => ({ group: 'Contact', label: s.name, hint: s.handle || 'open', run: () => open(s.href) })),
  { group: 'Actions', label: 'Toggle dark / light theme', hint: 'theme', run: toggleTheme },
];
