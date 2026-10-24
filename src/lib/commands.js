/* The brain of the terminal on the Lab page.
   To add a command: add its help text to HELP and its function to COMMANDS.
   A command gets (args, ctx) and returns a string, an array of lines, or { clear: true }. */
import { site, social, about, projects, pages } from '../data/site.js';
import { answer } from './assistant.js';

const bar = v => '#'.repeat(Math.round(v / 5)).padEnd(20, '.');

/* A tiny virtual file system built from your site data */
const tree = () => ({
  'about.txt': about.intro,
  'skills.txt': about.skills.map(([n, v]) => `${n.padEnd(12)} [${bar(v)}] ${v}%`).join('\n'),
  'contact.txt': [`phone      ${site.phone.text}`, `email      ${site.email.text}`, ...social.filter(s => s.href || s.handle).map(s => `${s.name.toLowerCase().padEnd(10)} ${s.href || s.handle}`)].join('\n'),
  projects: Object.fromEntries(projects.map(p => [p.slug + '.txt', `${p.title} (${p.category})\n${p.summary}`])),
});
const lookup = path => path.replace(/^\.?\/?/, '').split('/').filter(Boolean)
  .reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree());

const HELP = {
  help: 'list all commands', ask: 'ask about Jakub: ask where did he study', about: 'who I am', skills: 'my skills as bars', projects: 'list my projects',
  contact: 'phone, email and social links', ls: 'list files: ls [folder]', cat: 'read a file: cat about.txt',
  open: 'go to a page: open portfolio', theme: 'theme dark | light', neofetch: 'system info',
  ping: 'ping a host (simulated)', whoami: 'who are you', date: 'current date and time',
  echo: 'print text', history: 'commands you typed', clear: 'clear the screen (Ctrl+L)',
};

export const COMMANDS = {
  help: () => ['Available commands:', ...Object.entries(HELP).map(([c, d]) => `  ${c.padEnd(10)} ${d}`), 'Tip: press Tab to complete and the arrow keys for history.'],
  about: () => about.intro,
  ask: args => {
    const r = answer(args.join(' '));
    if (!r) return 'Usage: ask <question>, for example: ask what is his expertise';
    return (r.sample ? ['[sample data, not real yet]'] : []).concat(r.text);
  },
  skills: () => lookup('skills.txt'),
  projects: () => projects.map(p => `${p.slug.padEnd(16)} ${p.category.padEnd(8)} ${p.title}`),
  contact: () => lookup('contact.txt'),
  ls: ([path = '']) => {
    const node = path ? lookup(path) : tree();
    if (node === undefined) return `ls: cannot access '${path}': No such file or directory`;
    if (typeof node === 'string') return path;
    return Object.entries(node).map(([k, v]) => (typeof v === 'object' ? k + '/' : k)).join('  ');
  },
  cat: ([path]) => {
    if (!path) return 'cat: missing file name. Try: cat about.txt';
    const node = lookup(path);
    if (node === undefined) return `cat: ${path}: No such file or directory`;
    return typeof node === 'object' ? `cat: ${path}: Is a directory` : node;
  },
  open: ([page], ctx) => {
    if (!pages.some(p => p[1] === page)) return `open: unknown page. Pages: ${pages.map(p => p[1]).join(', ')}`;
    ctx.navigate(page);
    return `Opening ${page}...`;
  },
  theme: ([mode], ctx) => {
    if (mode !== 'dark' && mode !== 'light') return 'Usage: theme dark | light';
    ctx.setTheme(mode);
    return `Theme set to ${mode}.`;
  },
  neofetch: () => {
    const secs = Math.round(performance.now() / 1000);
    return [`jakub@${site.domain}`, '-'.repeat(site.domain.length + 6),
      `Site      ${site.domain}`, `Language  ${navigator.language}`, `Screen    ${screen.width}x${screen.height}`,
      `Theme     ${document.documentElement.getAttribute('data-theme')}`, `Uptime    ${secs}s on this page`];
  },
  ping: ([host = 'jakubadam.com']) => {
    const times = Array.from({ length: 4 }, () => (8 + Math.random() * 24).toFixed(1));
    return [`PING ${host} (simulated, nothing leaves your browser)`, ...times.map((t, i) => `64 bytes from ${host}: icmp_seq=${i + 1} ttl=57 time=${t} ms`),
      `4 packets transmitted, 4 received, 0% packet loss`];
  },
  whoami: () => 'visitor',
  date: () => new Date().toString(),
  echo: args => args.join(' '),
  history: (_, ctx) => ctx.history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`),
  clear: () => ({ clear: true }),
};
/* Splits a line into words, keeping "quoted text" together */
export const tokenize = line => (line.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.replace(/^["']|["']$/g, ''));

export function run(line, ctx) {
  const [cmd, ...args] = tokenize(line);
  if (!cmd) return [];
  if (!COMMANDS[cmd]) return [`${cmd}: command not found. Type "help" to see what works.`];
  const out = COMMANDS[cmd](args, ctx);
  return out === undefined ? [] : out;
}

const commonPrefix = words => words.reduce((p, w) => { let i = 0; while (i < p.length && p[i] === w[i]) i++; return p.slice(0, i); });

/* Tab completion: returns the new input line and, if there are several matches, the options */
export function complete(line) {
  const parts = line.split(/\s+/);
  const last = parts.pop();
  let pool;
  if (parts.length === 0) pool = Object.keys(COMMANDS);
  else if (parts[0] === 'open') pool = pages.map(p => p[1]);
  else if (parts[0] === 'theme') pool = ['dark', 'light'];
  else {
    const dir = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
    const node = dir ? lookup(dir) : tree();
    pool = node && typeof node === 'object' ? Object.entries(node).map(([k, v]) => dir + k + (typeof v === 'object' ? '/' : '')) : [];
  }
  const hits = pool.filter(p => p.startsWith(last));
  if (hits.length === 0) return { line, options: [] };
  if (hits.length === 1) return { line: [...parts, hits[0] + (hits[0].endsWith('/') ? '' : ' ')].join(' '), options: [] };
  return { line: [...parts, commonPrefix(hits)].join(' '), options: hits };
}
