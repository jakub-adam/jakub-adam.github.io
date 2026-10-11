export const site = {
  name: 'Jakub Adam',
  domain: 'jakubadam.com',
  lead: 'Projects, links and ways to reach me, all in one place.',
  photo: 'images/profile.jpg',
  phone: { text: '+421 907 669 331', href: 'tel:+421907669331' },
};

export const social = [
  { name: 'Instagram', icon: 'ig', handle: '@jakubadaam', href: 'https://instagram.com/jakubadaam' },
  { name: 'Discord',   icon: 'dc', handle: '',            href: '' },
  { name: 'Facebook',  icon: 'fb', handle: 'kuboadaam',   href: 'https://facebook.com/kuboadaam' },
  { name: 'GitHub',    icon: 'gh', handle: 'jakub-adam',  href: 'https://github.com/jakub-adam' },
];

export const pages = [['Home', 'home'], ['Portfolio', 'portfolio'], ['About', 'about'], ['News', 'news'], ['Contact', 'contact']];

const sample = 'Sample text. Replace this with a short description in your own words.';

export const about = {
  intro: "I'm Jakub. This site is where I keep my projects and links together. Sample text: write two or three sentences about yourself here.",
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

export const projects = [
  { slug: 'jakubadam-com', title: 'jakubadam.com', category: 'Web', summary: 'This site, built with React and hosted on GitHub Pages.',
    body: ['This is my personal site. It is built with React, has no backend, and is published for free with GitHub Pages.'],
    link: 'https://github.com/jakub-adam/jakub-adam.github.io' },
  ...['Project two', 'Project three', 'Project four', 'Project five', 'Project six'].map((title, i) => ({   // sample
    slug: 'project-' + (i + 2), title, category: ['Design', 'Web', 'Other', 'Design', 'Other'][i], summary: sample, body: [sample, sample],
  })),
];


export const posts = [
  ['welcome', 'Welcome to my new site'], ['working-on', 'What I am working on'], ['learned', 'Things I learned this year'],
  ['design', 'Behind the design'], ['next-steps', 'Next steps'],
].map(([slug, title]) => ({ slug, title, date: 'Sample date', excerpt: sample, body: [sample, sample, sample] }));  // sample
