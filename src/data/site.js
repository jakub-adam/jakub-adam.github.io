/* ===================================================================
   ALL YOUR CONTENT LIVES HERE. Edit the text, save, refresh the page.
   The "Ask Jakub" assistant answers only from this file, so the more
   you fill in, the better its answers get.

   Real details (name, phone, email, socials, languages, education) are filled in.
   Everything else is SAMPLE content and shows a "Sample" tag on the site.
   When you replace a sample with your own text, remove its "sample: true"
   (or set its flag in "samples" below to false) and the tag disappears.
   =================================================================== */

export const site = {
  name: 'Jakub Adam',
  domain: 'jakubadam.com',
  lead: 'Projects, links and ways to reach me, all in one place.',
  hello: "Hey, I'm Jakub.",                       // home page, next to your photo
  bio: 'I build websites and small experiments for the browser. Have a look around, try something in the Lab, or just say hi.',
  photo: 'images/profile.jpg', // put your photo in the images folder with this name
  phone: { text: '+421 907 669 331', href: 'tel:+421907669331' },
  email: { text: 'me@jakubadam.com', href: 'mailto:me@jakubadam.com' },
  /* The sky panel is drawn for this place: the night chart shows the stars above it right now,
     the day chart shows where the sun is. Change the name and the coordinates to move it. */
  place: { name: 'Vranov nad Topľou, SK', lat: 48.8842, lon: 21.6853 },
  tagline: 'React · GitHub Pages · no backend',   // small line at the bottom of every page
};

/* Social links. An entry with a handle but no href is shown as plain text on the
   Contact page (no link). An entry with neither is hidden. */
export const social = [
  { name: 'Instagram', icon: 'ig', handle: '@jakubadaam', href: 'https://instagram.com/jakubadaam' },
  { name: 'Discord',   icon: 'dc', handle: 'jakubadaam',  href: 'https://discord.com/users/498216866070659082' },
  { name: 'Facebook',  icon: 'fb', handle: 'kuboadaam',   href: 'https://facebook.com/kuboadaam' },
  { name: 'GitHub',    icon: 'gh', handle: 'jakub-adam',  href: 'https://github.com/jakub-adam' },
];

/* Pages: [label, url id, show in menu]. A page with false is not in the menu
   (Contact is reached with the "Get in touch" buttons and the search). */
export const pages = [['Home', 'home'], ['About', 'about'], ['Portfolio', 'portfolio'], ['Lab', 'lab'], ['News', 'news'], ['Contact', 'contact', false]];

/* Tools on the Lab page: [url id, name, short description, two-word label] */
export const labTools = [
  ['assistant', 'Ask Jakub', 'An assistant that answers questions about Jakub using only the details on this site. It runs in your browser and does not call any outside service.', 'Assistant'],
  ['terminal', 'Terminal', 'A small command line that runs entirely in your browser. Try help, neofetch, ls projects, ask where did he study, or open portfolio.', 'CLI'],
  ['sorting', 'Sorting visualizer', 'Six sorting algorithms written as JavaScript generators, so each step can be shown as an animation frame.', '6 algorithms'],
];

/* Text for the assistant */
export const assistant = {
  name: 'Ask Jakub',
  greeting: "Hi, I'm the assistant on Jakub's site. Ask me about his skills, studies, projects or how to reach him.",
};

/* Sections that still contain sample content (set to false when you fill them in) */
export const samples = { skills: true, languages: false, services: true, education: false, experience: true, now: true };

const sample = 'Sample text. Replace this with a short description in your own words.';

export const about = {
  intro: "I'm Jakub. This site is where I keep my projects and links together.",
  now: 'Sample text: describe what you are working on right now.',
  info: [
    ['First Name', 'Jakub'], ['Last Name', 'Adam'], ['Website', site.domain],
    ['GitHub', 'jakub-adam'], ['Instagram', '@jakubadaam'], ['Discord', 'jakubadaam'],
    ['Phone', site.phone.text], ['Email', site.email.text],
  ],
  skills: [['HTML & CSS', 90, '--accent'], ['JavaScript', 75, '--accent-2'], ['Figma', 65, '--accent-3']],
  languages: [['Slovak', 100, '--accent'], ['English', 90, '--accent-2'], ['Russian', 25, '--accent-3']],
  services: [['code', 'Web Development'], ['phone', 'App Development'], ['zap', 'Fast Learning'],
             ['pen', 'UI Design'], ['box', 'Side Projects'], ['mail', 'Communication']].map(([icon, title]) => ({ icon, title, text: sample })),
  education: [
    { date: '2023 - 2027', title: 'Secondary Technical School of Electrical Engineering, Prešov', text: 'Information and Network Technologies.' },
    { date: '2014 - 2023', title: 'Primary School Sídlisko II, Vranov nad Topľou', text: 'Primary school.' },
  ],
  /* Awards, prizes, competitions, certificates... one short line each, for example
     '1st place, regional programming contest (2025)'. Only the assistant uses this list.
     While it is empty, the assistant points to your projects and studies instead. */
  achievements: [],
  experience: [{ date: '2025 - Now', title: 'Sample role', text: sample }, { date: '2024', title: 'Sample project', text: sample }],
};

/* Portfolio. "slug" is the page address: #/portfolio/<slug>. The first project is the "Latest project" on the home page.
   Add  img: 'images/my-shot.jpg'  to use a screenshot instead of the generated art.
   Optional extras, all shown on the project sheet when present:
     tagline   a few words next to the title
     live      true shows a small "Live" badge
     stack     short list shown in the row
     link      the main button (the running project), source  a second button (the code)
     spec      [label, text] rows
     parts     [title, text] blocks, with partsTitle as their heading */
export const projects = [
  { slug: 'prime', title: 'Prime', category: 'Web', live: true, art: 'prime',
    tagline: 'every health metric in one place',
    summary: 'Every health metric in one place. Food, training, body and activity, tracked in a web app that runs on GitHub Pages.',
    body: ['A personal health tracker I built for myself and use every day. Food, training, body and activity live in one web app that runs entirely on GitHub Pages, with no server behind it.'],
    stack: ['React', 'TypeScript', 'PWA'],
    link: 'https://prime.jakubadam.com', source: 'https://github.com/jakub-adam/prime',
    spec: [
      ['Type', 'Personal project. A web app you can add to an iPhone home screen.'],
      ['Hosting', 'GitHub Pages. Static files only, deployed on every push.'],
      ['Data', 'A private GitHub repo, read and written through the GitHub API. The token never leaves the browser.'],
      ['Stack', 'Vite, React, TypeScript, Tailwind CSS, Radix, Recharts'],
      ['Offline', 'Keeps working with the last data it loaded. Edits queue up and sync later.'],
    ],
    partsTitle: 'What it tracks',
    parts: [
      ['Food', 'Meals and macros, by day and by week.'],
      ['Training', 'Strength sessions, logged set by set.'],
      ['Body', 'Weight and measurements over time.'],
      ['Activity', 'Runs and walks with route maps, splits and heart-rate zones.'],
      ['Health', 'Apple Health import: heart, sleep stages, respiratory, mobility.'],
      ['Today', 'The whole day at a glance, updated live from an iPhone Shortcut.'],
    ] },
  { slug: 'jakubadam-com', title: 'jakubadam.com', category: 'Web', summary: 'This site, built with React and hosted on GitHub Pages.',
    body: ['This is my personal site. It is built with React, has no backend, and is published for free with GitHub Pages.'],
    stack: ['React', 'No backend'],
    source: 'https://github.com/jakub-adam/jakub-adam.github.io' },
  ...['Project two', 'Project three', 'Project four', 'Project five', 'Project six'].map((title, i) => ({
    slug: 'project-' + (i + 2), title, category: ['Design', 'Web', 'Other', 'Design', 'Other'][i], summary: sample, body: [sample, sample], sample: true,
  })),
];

/* News posts. Page address: #/news/<slug> */
export const posts = [
  ['welcome', 'Welcome to my new site'], ['working-on', 'What I am working on'], ['learned', 'Things I learned this year'],
  ['design', 'Behind the design'], ['next-steps', 'Next steps'],
].map(([slug, title]) => ({ slug, title, date: 'Sample date', excerpt: sample, body: [sample, sample, sample], sample: true }));
