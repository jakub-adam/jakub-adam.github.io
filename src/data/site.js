export const site = {

  name:     'Jakub Adam',

  domain:   'jakubadam.com',

  lead:     'Projects, links and ways to reach me, all in one place.',

  photo:    'images/profile.jpg',

  phone: { 
    text: '+421 907 669 331', 
    href: 'tel:+421907669331' 
  },

};

export const social = [

  {
    name:   'Instagram',
    icon:   'ig',
    handle: '@jakubadaam',
    href:   'https://instagram.com/jakubadaam'
  },

  {
    name:   'Discord',
    icon:   'dc',
    handle: 'jakubadaam',
    href:   ''
  },

  {
    name:   'Facebook',
    icon:   'fb',
    handle: 'kuboadaam',
    href:   'https://facebook.com/kuboadaam'
  },

  {
    name:   'GitHub',
    icon:   'gh',
    handle: 'jakub-adam',
    href:   'https://github.com/jakub-adam'
  },

];

export const pages = [

  ['Home',       'home'],
  ['Portfolio',  'portfolio'],
  ['About',      'about'],
  ['News',       'news'],
  ['Contact',    'contact'],

];

const sample = 'SERUS.';

export const about = {

  intro: "I'm Jakub. This site is where I keep my projects and links together. Sample text: write two or three sentences about yourself here.",

  info: [

    ['First Name',  'Jakub'],
    ['Last Name',   'Adam'],
    ['Website',     site.domain],
    ['GitHub',      'jakub-adam'],
    ['Instagram',   '@jakubadaam'],
    ['Phone',       site.phone.text],

  ],

  skills: [

    ['skill 1',     100, '--r'],
    ['skill 2',     100, '--b'],
    ['skill 3',     100, '--g'],

  ],

  languages: [

    ['Language 1',  100, '--r'],
    ['Language 2',  100, '--b'],
    ['Language 3',  100, '--g'],

  ],

  services: [

    { icon: '1',  title: 'Service 1',  text: sample },
    { icon: '6',  title: 'Service 2',  text: sample },
    { icon: '5',  title: 'Service 3',  text: sample },
    { icon: '4',  title: 'Service 4',  text: sample },
    { icon: '3',  title: 'Service 5',  text: sample },
    { icon: '2',  title: 'Service 6',  text: sample },

  ],

  education: [

    { date: '2013 - now',  title: 'Secondary Industrial School of Electrical Engineering, Presov, Slovakia', text: sample },
    { date: '2014 - 2023', title: 'Primary School, Sidlisko II 1336, Vranov nad Toplou, Slovakia', text: sample },

  ],

  experience: [

    { date: 'xxxx - xxxx',        title: 'Sample role',    text: sample },
    { date: 'xxxx', Placeholder , title: 'Sample project', text: sample },

  ],

};

export const projects = [

  {
    slug:     'jakubadam-com',
    title:    'jakubadam.com',
    category: 'Web',
    summary:  'This site, built with React and hosted on GitHub Pages.',
    body:     ['This is my personal site. It is built with React, has no backend, and is published for free with GitHub Pages.'],
    link:     'https://github.com/jakub-adam/jakub-adam.github.io'
  },

  {
    slug:     'project-2',
    title:    'Project two',
    category: 'Design',
    summary:  sample,
    body:     [sample, sample]
  },

  {
    slug:     'project-3',
    title:    'Project three',
    category: 'Web',
    summary:  sample,
    body:     [sample, sample]
  },

  {
    slug:     'project-4',
    title:    'Project four',
    category: 'Other',
    summary:  sample,
    body:     [sample, sample]
  },

  {
    slug:     'project-5',
    title:    'Project five',
    category: 'Design',
    summary:  sample,
    body:     [sample, sample]
  },

  {
    slug:     'project-6',
    title:    'Project six',
    category: 'Other',
    summary:  sample,
    body:     [sample, sample]
  },

];

export const posts = [

  {
    slug:    'welcome',
    title:   'Welcome to my new site',
    date:    'Sample date',
    excerpt: sample,
    body:    [sample, sample, sample]
  },

  {
    slug:    'working-on',
    title:   'What I am working on',
    date:    'Sample date',
    excerpt: sample,
    body:    [sample, sample, sample]
  },

  {
    slug:    'learned',
    title:   'Things I learned this year',
    date:    'Sample date',
    excerpt: sample,
    body:    [sample, sample, sample]
  },

  {
    slug:    'design',
    title:   'Behind the design',
    date:    'Sample date',
    excerpt: sample,
    body:    [sample, sample, sample]
  },

  {
    slug:    'next-steps',
    title:   'Next steps',
    date:    'Sample date',
    excerpt: sample,
    body:    [sample, sample, sample]
  },

];
