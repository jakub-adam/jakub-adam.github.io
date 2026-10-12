/* ===================================================================
   ALL YOUR CONTENT LIVES HERE. Edit the text, save, refresh the page.
   The "Ask Jakub" assistant answers only from this file, so the more
   you fill in, the better its answers get.

   Real details (name, phone, Instagram, Facebook, GitHub) are filled in.
   Everything else is SAMPLE content and shows a "Sample" tag on the site.
   When you replace a sample with your own text, remove its "sample: true"
   (or set its flag in "samples" below to false) and the tag disappears.
   =================================================================== */

export const site = {
  name: 'Jakub Adam',
  domain: 'jakubadam.com',
  lead: 'Projects, links and ways to reach me, all in one place.',
  photo: 'images/profile.jpg', // put your photo in the images folder with this name
  phone: { text: '+421 907 669 331', href: 'tel:+421907669331' },
};

/* Social links. An entry with an empty href is hidden, so paste your Discord link
   into the empty one when you have it. */
export const social = [
  { name: 'Instagram', icon: 'ig', handle: '@jakubadaam', href: 'https://instagram.com/jakubadaam' },
  { name: 'Discord',   icon: 'dc', handle: '',            href: '' },
  { name: 'Facebook',  icon: 'fb', handle: 'kuboadaam',   href: 'https://facebook.com/kuboadaam' },
  { name: 'GitHub',    icon: 'gh', handle: 'jakub-adam',  href: 'https://github.com/jakub-adam' },
];

/* Pages: [label, url id, show in menu]. A page with false is not in the menu
   (Contact is reached with the "Get in touch" buttons and the search). */
export const pages = [['Home', 'home'], ['About', 'about'], ['Portfolio', 'portfolio'], ['Lab', 'lab'], ['News', 'news'], ['Contact', 'contact', false]];

/* Tools on the Lab page: [url id, name, short description] */
export const labTools = [
  ['assistant', 'Ask Jakub', 'An assistant that answers questions about Jakub using only the details on this site. It runs in your browser and does not call any outside service.'],
  ['terminal', 'Terminal', 'A small command line that runs entirely in your browser. Try help, neofetch, ls projects, ask where did he study, or open portfolio.'],
  ['sorting', 'Sorting visualizer', 'Six sorting algorithms written as JavaScript generators, so each step can be shown as an animation frame.'],
];

/* Text for the assistant */
export const assistant = {
  name: 'Ask Jakub',
  greeting: "Hi, I'm the assistant on Jakub's site. Ask me about his skills, studies, projects or how to reach him.",
};

/* Sections that still contain sample content (set to false when you fill them in) */
export const samples = { skills: true, languages: true, services: true, education: true, experience: true, now: true };

const sample = 'Sample text. Replace this with a short description in your own words.';

export const about = {
  intro: "I'm Jakub. This site is where I keep my projects and links together.",
  now: 'Sample text: describe what you are working on right now.',
  info: [
    ['First Name', 'Jakub'], ['Last Name', 'Adam'], ['Website', site.domain],
    ['GitHub', 'jakub-adam'], ['Instagram', '@jakubadaam'], ['Phone', site.phone.text],
  ],
  skills: [['HTML & CSS', 90, '--r'], ['JavaScript', 75, '--b'], ['Figma', 65, '--g']],
  languages: [['Language 1', 95, '--r'], ['Language 2', 85, '--b'], ['Language 3', 60, '--g']],
  services: [['code', 'Web Development'], ['phone', 'App Development'], ['zap', 'Fast Learning'],
             ['pen', 'UI Design'], ['box', 'Side Projects'], ['mail', 'Communication']].map(([icon, title]) => ({ icon, title, text: sample })),
  education: [{ date: '2022 - 2026', title: 'School name', text: sample }, { date: '2018 - 2022', title: 'Previous school', text: sample }],
  experience: [{ date: '2025 - Now', title: 'Sample role', text: sample }, { date: '2024', title: 'Sample project', text: sample }],
};

/* Portfolio. "slug" is the page address: #/portfolio/<slug>.
   Add  img: 'images/my-shot.jpg'  to use a screenshot instead of the generated art. */
export const projects = [
  { slug: 'jakubadam-com', title: 'jakubadam.com', category: 'Web', summary: 'This site, built with React and hosted on GitHub Pages.',
    body: ['This is my personal site. It is built with React, has no backend, and is published for free with GitHub Pages.'],
    link: 'https://github.com/jakub-adam/jakub-adam.github.io' },
  ...['Project two', 'Project three', 'Project four', 'Project five', 'Project six'].map((title, i) => ({
    slug: 'project-' + (i + 2), title, category: ['Design', 'Web', 'Other', 'Design', 'Other'][i], summary: sample, body: [sample, sample], sample: true,
  })),
];

/* News posts. Page address: #/news/<slug> */
export const posts = [
  ['welcome', 'Welcome to my new site'], ['working-on', 'What I am working on'], ['learned', 'Things I learned this year'],
  ['design', 'Behind the design'], ['next-steps', 'Next steps'],
].map(([slug, title]) => ({ slug, title, date: 'Sample date', excerpt: sample, body: [sample, sample, sample], sample: true }));
