/* "Ask Jakub": a small assistant that runs in the browser.
   There is no AI service behind it (a free GitHub Pages site cannot hide an API key).
   It reads your question, finds the best matching topic from src/data/site.js, and writes
   the reply from one of several templates, so asking the same question twice gives
   different wording. Change the data and its answers change too.

   To teach it a new topic, add an object to topics() below:
     keys     words that point to the topic        phrases   whole phrases (worth more)
     openers  reply templates. {name}, {skills}, {phone}... are filled in from your data
     next     topics to suggest afterwards         sample    true while the data is still a placeholder */
import { site, social, about, samples, projects, posts, labTools } from '../data/site.js';

/* ---------- reading the question ---------- */
const STOP = new Set(('a an the is are was were be been am do does did has have had can could would should will of to in on at for with by from and or but ' +
  'if so as it its this that these those he his him she her they them their you your i me my we our what whats which who whom whose where when why how ' +
  'tell please just really also any some there here more very').split(' '));
const ALIAS = { js: 'javascript', ig: 'instagram', insta: 'instagram', fb: 'facebook', gh: 'github', dc: 'discord', uni: 'university', repos: 'repo' };
const GENERIC = new Set(['project', 'post', 'site', 'new', 'news', 'skill', 'work', 'page', 'web']); // too common to identify one specific item

const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
const stem = w => (w.length > 3 ? w.replace(/(ied|ies)$/, 'y').replace(/(ing|ed)$/, '').replace(/([^su])s$/, '$1') : w);
const words = text => normalize(text).split(/\s+/).filter(w => w && !STOP.has(w)).map(w => stem(ALIAS[w] || w));

/* true when two words differ by at most one typo (a wrong, missing, extra or swapped letter) */
const within1 = (a, b) => {
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 5) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (i === a.length && i === b.length) return true;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
};

/* ---------- variety: templates, a fresh pick each time, never the same one twice in a row ---------- */
const lastPick = new Map();
const pick = (key, list) => {
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastPick.get(key));
  lastPick.set(key, i);
  return list[i];
};
const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

const CLOSERS = [
  'Anything else you would like to know?', 'Ask me about his projects next if you like.', 'I can also tell you how to reach him.', "That's all I have on that for now.",
  'Feel free to ask another question.', 'Curious about something else?', 'Happy to go deeper on another topic.', 'Let me know if you want more.',
  'You can also try the terminal in the Lab.', 'Press Ctrl K to search the whole site.', 'Want to hear about something else?', 'Ask away if there is more you want to know.',
];
const finish = text => (Math.random() < 0.65 ? text + (text.includes('\n') ? '\n\n' : ' ') + pick('closer', CLOSERS) : text);

const and = a => (a.length === 0 ? 'nothing yet' : a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const bullets = a => a.map(x => '• ' + x).join('\n');
const open = (label, hash) => ({ label, hash });

/* The values that templates can use, always read fresh from your data */
const vars = () => {
  const top = [...about.skills].sort((a, b) => b[1] - a[1])[0] || ['skills', 0];
  const rest = about.skills.filter(s => s !== top).map(s => s[0]);
  const lv = ([n, v]) => `${n} (${v}%)`;
  const edu = about.education.map(e => `${e.title} (${e.date})`), exp = about.experience.map(e => `${e.title} (${e.date})`);
  const live = social.filter(s => s.href), featured = projects.find(p => !p.sample) || projects[0];
  return {
    name: 'Jakub', full: site.name, domain: site.domain, phone: site.phone.text, intro: about.intro, now: about.now,
    skills: and(about.skills.map(lv)), skillLines: bullets(about.skills.map(lv)), skillNames: and(about.skills.map(s => s[0])),
    topSkill: top[0], topLevel: top[1], otherSkills: rest.length ? and(rest) : 'a few other things',
    langs: and(about.languages.map(lv)), langLines: bullets(about.languages.map(lv)),
    study: and(edu), studyLines: bullets(edu), latestSchool: about.education[0] ? about.education[0].title : 'school',
    work: and(exp), workLines: bullets(exp),
    socials: and(live.map(s => `${s.name} (${s.handle})`)), socialLines: bullets(live.map(s => `${s.name}: ${s.handle}`)),
    projects: and(projects.map(p => p.title)), projectLines: bullets(projects.map(p => `${p.title} (${p.category})`)), projectCount: projects.length, featured: featured ? featured.title : 'his work',
    posts: and(posts.map(p => p.title)), postLines: bullets(posts.map(p => p.title)), postCount: posts.length, firstPost: posts[0] ? posts[0].title : 'a post',
    services: and(about.services.map(s => s.title.toLowerCase())),
    labTools: and(labTools.map(t => t[1].toLowerCase())), labLines: bullets(labTools.map(t => `${t[1]}: ${t[2]}`)), labCount: labTools.length,
  };
};

/* ---------- topics ---------- */
export const QUESTIONS = {
  name: 'Who is Jakub?', expertise: 'What is his expertise?', languages: 'Which languages does he speak?', study: 'Where did he study?',
  work: 'Where has he worked?', now: 'What is he working on now?', projects: 'What has he built?', site: 'How was this site built?',
  lab: 'What is in the lab?', news: 'What has he written?', services: 'What does he do?', contact: 'How can I contact him?',
  collab: 'Can I work with him?', howto: 'How do I use this site?', sorting: 'What does the sorting visualizer do?', terminal: 'What can the terminal do?',
};
export const STARTERS = [QUESTIONS.expertise, QUESTIONS.study, QUESTIONS.now, QUESTIONS.projects, QUESTIONS.contact];
const randomQuestions = n => shuffle(Object.values(QUESTIONS)).slice(0, n);

const topics = () => [
  { id: 'name', keys: 'person about bio background', phrases: ['who is', 'tell me about', 'about jakub', 'about him'], sample: false, next: ['expertise', 'study', 'now'], actions: () => [open('Open About', '#/about')],
    openers: [
      `{name} is the person behind this site. {intro} You'll find him online at {domain}.`, `{intro} The portfolio, the Lab and everything else here belongs to {name}.`,
      `Short version: {full}. {intro}`, `That's {full}. {intro} Ask about his skills, studies or projects if you want more.`, `{full} runs {domain}. {intro}`,
      `Meet {name}. {intro}`, `In a sentence: {intro} The site is at {domain}.`, `{name} is the owner of this site. {intro}`,
    ] },
  { id: 'contact', keys: 'contact phone call number telephone reach message talk social instagram facebook github discord', phrases: ['get in touch', 'how can i', 'reach him', 'contact him', 'his contact'], sample: false, next: ['collab', 'projects', 'expertise'],
    actions: () => [{ label: 'Call', href: site.phone.href }, ...social.filter(s => s.href).map(s => ({ label: s.name, href: s.href }))],
    openers: [
      `The quickest way to reach {name} is by phone: {phone}. You can also find him on {socials}.`, `You can call {name} on {phone}, or message him on {socials}.`,
      `Here's how to get in touch:\n• Phone: {phone}\n{socialLines}`, `Phone {phone}, or look him up on {socials}. Both work.`,
      `Reaching {name} is easy: call {phone} or message him on {socials}.`, `Contact options:\n• Call: {phone}\n{socialLines}`,
      `Want to talk? He's on {socials}, or you can ring {phone}.`, `To get in touch, use {phone} or one of his profiles: {socials}.`,
    ] },
  { id: 'collab', keys: 'hire hiring available availability freelance collaborate collaboration opportunity', phrases: ['work with him', 'hire him', 'work together', 'working together', 'for hire', 'open to work'], sample: false, next: ['contact', 'projects', 'expertise'],
    actions: () => [{ label: 'Call', href: site.phone.href }, open('Open portfolio', '#/portfolio')],
    openers: [
      `If you'd like to work with {name}, the best move is to contact him directly: {phone}, or {socials}.`, `I don't have availability details, but you can ask {name} yourself on {phone}.`,
      `For collaborations, message {name} on {socials} or call {phone}.`, `Interested in working together? Reach out: {phone}, {socials}.`,
      `Hiring or collaborating isn't spelled out on the site, so just get in touch: {phone}.`, `The quickest way to start a conversation is {phone} or {socials}.`,
    ] },
  { id: 'expertise', keys: 'expertise skill ability abilities strength strengths stack technology technical programming code coding proficient expert talent specialty specialize specialise specialist capable', phrases: ['good at', 'what can he do', 'tech stack he', 'his stack'], sample: samples.skills, next: ['study', 'now', 'projects'], actions: () => [open('Open About', '#/about')],
    openers: [
      `{name}'s main skills are {skills}.`, `If I had to sum up his skills: {skills}.`, `Here's where he's strongest:\n{skillLines}`, `He works with {skillNames}. His strongest is {topSkill} at {topLevel}%.`,
      `His expertise covers {skills}.`, `Skills-wise, {name} lists {skills}.`, `{topSkill} is his strongest area, and he also knows {otherSkills}.`, `Here's his skill set at a glance:\n{skillLines}`,
    ] },
  { id: 'languages', keys: 'language speak spoken fluent fluency english slovak german czech foreign', phrases: ['does he speak', 'what languages'], sample: samples.languages, next: ['study', 'expertise'], actions: () => [open('Open About', '#/about')],
    openers: [
      `He speaks {langs}.`, `Language-wise: {langs}.`, `{name} communicates in {langs}.`, `Here's what he speaks:\n{langLines}`, `His languages are {langs}.`, `You can talk to him in {langs}.`,
    ] },
  { id: 'study', keys: 'study studying school education university college degree graduate graduated learn class course student gymnasium academy', phrases: ['where did he study', 'went to school', 'did he go to'], sample: samples.education, next: ['work', 'expertise'], actions: () => [open('Open About', '#/about')],
    openers: [
      `{name} studied at {study}.`, `Education-wise: {study}.`, `Here's his education:\n{studyLines}`, `He went to {study}.`, `His schooling: {study}.`,
      `His latest stop is {latestSchool}. The full picture: {study}.`, `On the education side, there's {study}.`,
    ] },
  { id: 'work', keys: 'work worked job experience career employ employer company role professional internship position', phrases: ['where has he worked', 'work experience', 'has he worked'], sample: samples.experience, next: ['now', 'projects'], actions: () => [open('Open About', '#/about')],
    openers: [
      `On the work side: {work}.`, `Here's his experience:\n{workLines}`, `His experience includes {work}.`, `{name}'s experience so far: {work}.`, `Career-wise: {work}.`, `Experience at a glance:\n{workLines}`,
    ] },
  { id: 'now', keys: 'now currently current lately recently present busy', phrases: ['working on', 'right now', 'these days', 'at the moment', 'what is he doing', 'whats he doing', 'up to'], sample: samples.now, next: ['projects', 'expertise'], actions: () => [open('Open About', '#/about')],
    openers: [
      `Right now: {now}`, `Currently on his plate: {now}`, `Lately: {now}`, `What's {name} up to? {now}`, `Here's the latest from him: {now}`, `These days: {now}`, `His current focus: {now}`,
    ] },
  { id: 'projects', keys: 'project portfolio built build made make create created app showcase', phrases: ['what has he built', 'what did he build', 'what has he made', 'what has he created', 'show me his work', 'his projects'], sample: false, next: ['site', 'contact'], actions: () => [open('Open portfolio', '#/portfolio')],
    openers: [
      `{name} has {projectCount} projects listed: {projects}.`, `Here's what he's built:\n{projectLines}`, `His portfolio includes {projects}.`, `Projects so far: {projects}. The one that's filled in is {featured}.`,
      `Portfolio highlights:\n{projectLines}`, `He's built {projects}.`,
    ] },
  { id: 'site', keys: 'site website react hosted hosting pages framework backend', phrases: ['this site', 'this website', 'how was this', 'built with', 'how is this', 'site use', 'site made'], sample: false, next: ['lab', 'howto'], actions: () => [open('Open the Lab', '#/lab')],
    openers: [
      `This site is built with React and runs without a backend on GitHub Pages.`, `It's a React site hosted for free on GitHub Pages: no backend, no build step, just JavaScript modules.`,
      `Under the hood: React, hash-based routing, a canvas starfield, a command palette on Ctrl K and a Lab with {labCount} tools.`, `{domain} is a React site on GitHub Pages. The Lab has {labTools}.`,
      `No frameworks beyond React: the router, search, assistant and animations are custom code in plain JavaScript.`, `The stack is simple: React for the interface, GitHub Pages for hosting, and no server.`,
      `Everything runs in your browser, including me. The content lives in a single data file.`, `It's a static site: React in the browser, hosted on GitHub Pages, with all the text kept in one data file.`,
    ] },
  { id: 'lab', keys: 'lab tool demo interactive playground', phrases: ['in the lab', 'the lab'], sample: false, next: ['sorting', 'terminal', 'site'], actions: () => [open('Open the Lab', '#/lab')],
    openers: [
      `The Lab has {labCount} tools: {labTools}.`, `In the Lab you can try:\n{labLines}`, `Lab: {labTools}. All of them run right in your browser.`, `There are {labCount} things to play with in the Lab: {labTools}.`,
      `Here's the Lab lineup:\n{labLines}`, `Try the Lab, it has {labTools}.`,
    ] },
  { id: 'sorting', keys: 'sort sorting algorithm bubble quick merge heap insertion selection visualizer visualiser', phrases: ['sorting visualizer'], sample: false, next: ['terminal', 'lab'], actions: () => [open('Open the Lab', '#/lab/sorting')],
    openers: [
      `The sorting visualizer animates six algorithms: bubble, insertion, selection, quick, merge and heap sort. Pick one and press Start.`, `It's a Lab tool where you can watch sorting algorithms work step by step. They're written as JavaScript generators.`,
      `Choose an algorithm, set the speed, then watch the bars get sorted. It counts comparisons and swaps too.`, `Six algorithms, adjustable speed and a Step button to advance one move at a time: that's the sorting visualizer.`,
      `Open Lab > Sorting visualizer to compare how quick sort and bubble sort handle the same shuffled bars.`, `Highlighted bars are being compared, and the whole row turns green when it's sorted.`,
    ] },
  { id: 'terminal', keys: 'terminal command shell console cli prompt', phrases: ['the terminal'], sample: false, next: ['sorting', 'lab'], actions: () => [open('Open the Lab', '#/lab/terminal')],
    openers: [
      `The Lab has a small terminal. Try help, ls projects, neofetch or even ask where did he study.`, `It's a tiny command line in your browser, with history, Tab completion and a virtual file system built from the site's data.`,
      `Open Lab > Terminal and type help. You can cat files like about.txt, open pages and switch the theme.`, `A terminal emulator lives in the Lab: arrow keys for history, Tab to complete, Ctrl L to clear.`,
      `Type commands like ls, cat skills.txt or open portfolio. It has me built in too: ask <question>.`, `It behaves like a real shell, just simulated: ls, cat, open, theme, neofetch, ping and more.`,
    ] },
  { id: 'news', keys: 'news post blog article write written writing update', phrases: ['what has he written', 'any posts', 'whats new'], sample: posts.every(p => p.sample), next: ['projects', 'now'], actions: () => [open('Open News', '#/news')],
    openers: [
      `Latest posts: {posts}.`, `There are {postCount} posts on the News page:\n{postLines}`, `{name} has {postCount} posts so far, like "{firstPost}".`, `News page: {posts}.`,
      `Here's what's on the News page:\n{postLines}`, `Recent writing includes {posts}.`,
    ] },
  { id: 'services', keys: 'service offer', phrases: ['what does he do', 'what do you do', 'areas he works', 'what he does'], sample: samples.services, next: ['expertise', 'contact'], actions: () => [open('Open About', '#/about')],
    openers: [
      `He works on {services}.`, `What does {name} do? {services}.`, `His areas: {services}.`, `{name} covers {services}.`, `Areas he works in include {services}.`, `The About page lists {services} as the things he does.`,
    ] },
  { id: 'howto', keys: 'search shortcut keyboard navigate navigation menu theme', phrases: ['how do i use', 'how to use', 'dark mode', 'light mode', 'use this site', 'around the site'], sample: false, next: ['lab', 'site'], actions: () => [],
    openers: [
      `Press Ctrl K (or ⌘K) anywhere to open search, then type to jump to any page, project or tool.`, `Use the menu or the bottom tabs to move around, Ctrl K to search, and the switch in the footer for dark or light mode.`,
      `Tip: the sparkle button opens me, and Ctrl K opens search. The Lab has a terminal and a sorting visualizer.`, `Navigation is simple: the menu for pages, Ctrl K for search, and "/" also opens search.`,
      `Try the Lab for interactive things, or press Ctrl K and start typing what you're looking for.`, `On a phone use the bottom tabs; on a computer use the menu button. Search works everywhere with the magnifier.`,
    ] },
  { id: 'private', keys: 'age old born birthday birth live living city country address salary price income hobby hobbie interest favorite favourite food music family married relationship girlfriend boyfriend height weight religion politic', phrases: ['where is he from', 'where does he live', 'where is he based', 'how old', 'what age', 'when was he born', 'his email', 'his address', 'how much does he', 'is he married', 'does he have a'], sample: false, next: ['contact', 'expertise', 'projects'], actions: () => [{ label: 'Call', href: site.phone.href }],
    openers: [
      `That isn't something {name} has shared on this site, so I can't say.`, `I only know what's on the site, and that detail isn't there.`, `Good question, but {name} hasn't added that here. You could ask him directly on {phone}.`,
      `That's not in my notes, and I'd rather not guess.`, `I don't have that on file. {name} is easiest to reach on {socials}.`, `Sorry, that isn't published on the site. Maybe ask him on {socials}?`,
      `No info on that: I stick to what's on the site.`, `That detail isn't listed anywhere on this site, and I won't make something up.`, `I can't answer that from the site's details. {name} can, though: {phone}.`,
      `Not covered by anything I know about {name}. Try asking him directly.`,
    ] },
];

/* Topics for one specific thing: a skill, a project, a post or a platform */
const specifics = q => {
  const list = [];
  about.skills.forEach(([skill, level]) => list.push({ id: 'skill', words: words(skill), vars: { skill, level }, sample: samples.skills, next: ['expertise', 'study', 'projects'], actions: () => [open('Open About', '#/about')],
    openers: [`{skill}? Yes, {name} lists it at {level}%.`, `{name} rates his {skill} at {level}%.`, `He knows {skill}, around {level}% by his own scale.`, `{skill} is on his list with a level of {level}%.`, `Yes, {skill} is one of his skills ({level}%).`, `His {skill} level is listed as {level}%.`] }));
  projects.forEach((p, i) => list.push({ id: 'project', words: words(p.title), vars: { title: p.title, category: p.category, summary: p.summary }, sample: !!p.sample, next: ['projects', 'contact'], actions: () => [open('Open project', '#/portfolio/' + p.slug)],
    openers: [`{title} is a {category} project: {summary}`, `About {title}: {summary} It's filed under {category}.`, `{title} ({category}): {summary}`, `Here's {title}. {summary}`, `{title} sits in the {category} category. {summary}`, `Quick rundown of {title}: {summary}`] }));
  posts.forEach(p => list.push({ id: 'post', words: words(p.title), vars: { title: p.title, excerpt: p.excerpt, date: p.date }, sample: !!p.sample, next: ['news', 'projects'], actions: () => [open('Read post', '#/news/' + p.slug)],
    openers: [`"{title}" is one of the posts on the News page. {excerpt}`, `"{title}": {excerpt}`, `There's a post called "{title}". {excerpt}`, `About "{title}": {excerpt}`, `"{title}" was posted on {date}. {excerpt}`, `Take a look at "{title}" on the News page. {excerpt}`] }));
  const extra = { instagram: [], facebook: [], github: ['repo', 'repository'], discord: [] };
  social.forEach(s => {
    const key = s.name.toLowerCase();
    list.push({ id: 'platform', words: [stem(key), ...(extra[key] || [])], vars: { platform: s.name, handle: s.handle }, sample: false, next: ['contact', 'projects'],
      actions: () => (s.href ? [{ label: 'Open ' + s.name, href: s.href }] : [{ label: 'Call', href: site.phone.href }]),
      openers: s.href
        ? [`{name} is {handle} on {platform}.`, `On {platform} you'll find him as {handle}.`, `{platform}: {handle}. You can open it from the Contact page.`, `His {platform} handle is {handle}.`, `Find him on {platform} as {handle}.`, `Search for {handle} on {platform}.`]
        : [`{name} hasn't shared a {platform} yet. Try {socials} instead.`, `There's no {platform} listed for {name} yet. {socials} work.`, `No {platform} link on the site for now. You can reach him on {socials}.`, `{platform} isn't set up on this site yet, but {socials} are.`, `He hasn't added {platform} here. Use {socials} instead.`] });
  });
  // "does he know Python?": a skill that is not on the list
  const m = q.low.match(/\b(?:know|knows|use|uses|using|code in|program in|programs in|work with|works with|experience (?:with|in)|familiar with|skilled in|good at|proficient in)\s+(?:the\s+)?([a-z0-9+#.]{2,})/);
  if (m && !STOP.has(m[1]) && !q.known.has(stem(m[1])) && !about.skills.some(([n]) => words(n).includes(stem(ALIAS[m[1]] || m[1])))) {
    const name = m[1].charAt(0).toUpperCase() + m[1].slice(1);
    list.push({ id: 'skillMissing', words: [], force: 12, vars: { skill: name }, sample: samples.skills, next: ['expertise', 'projects'], actions: () => [open('Open About', '#/about')],
      openers: [`{skill} isn't on {name}'s skill list. He lists {skills}.`, `I don't see {skill} among his skills, which are {skills}.`, `{skill} isn't listed. What I do have is {skills}.`, `Not that I know of: his listed skills are {skills}.`, `{skill} doesn't appear on the site. His skills: {skills}.`] });
  }
  return list;
};

/* ---------- small talk ---------- */
const TALK = [
  { id: 'howareyou', test: /how are you|how('s| is) it going|how do you do|what'?s up\b|how you doing/, say: [
    `I'm doing well, thanks for asking. What would you like to know about {name}?`, `All good here. Ask me anything about {name}.`, `Great, ready for questions about {name}.`, `Can't complain, I'm a small piece of code. How can I help?`,
    `Doing fine! Want to hear about his projects?`, `I'm well. Shall we talk about {name}'s skills?`, `Running smoothly. What are you curious about?`, `Good, thanks! Ask me something about {name}.`, `Feeling fast and responsive. What can I tell you?`, `All systems normal. What's your question?`] },
  { id: 'hello', test: /^\s*(hi|hello|hey|hola|ahoj|yo|sup|howdy|greetings|good (morning|afternoon|evening))\b/, say: [
    `Hello! Ask me anything about {name}.`, `Hi there! I can tell you about {name}'s skills, studies and projects.`, `Hey! What would you like to know about {name}?`, `Welcome! Try asking where {name} studied or what he's working on.`,
    `Hi! I'm Ask Jakub. Ask away.`, `Hello and welcome to {domain}. What can I tell you?`, `Hey, nice to see you here. Curious about {name}'s work?`, `Hi! Questions about {name} are my specialty.`,
    `Good to see you. Shall we start with his projects?`, `Hello! Fire away with any question about {name}.`] },
  { id: 'thanks', test: /\b(thanks|thank you|thx|cheers|appreciate it)\b/, say: [
    `You're welcome. Anything else you'd like to know?`, `Happy to help!`, `Anytime. Ask me more if you like.`, `My pleasure.`, `No problem at all.`, `Glad that helped. Want to know something else?`, `You got it.`,
    `Thank you for asking. I'm here if you have more.`, `Sure thing!`, `Anytime, that's what I'm here for.`] },
  { id: 'bye', test: /\b(bye|goodbye|see you|cya|good night|talk later)\b/, say: [
    `Thanks for stopping by. Have a good one.`, `Goodbye! Come back any time.`, `See you later!`, `Take care, and thanks for visiting {domain}.`, `Bye for now!`, `Have a great day!`,
    `Until next time.`, `Thanks for chatting. Bye!`, `Catch you later.`, `Leave whenever you like, I'll be here.`] },
  { id: 'identity', test: /(who|what) are you|introduce yourself|your name|are you (an? )?(ai|bot|human|real|chatgpt|robot)|how do you work|who (made|built|created) you/, say: [
    `I'm Ask Jakub, a small assistant built into this site. I'm not a general AI: I only know what {name} has put on the site.`, `I'm a little program that answers questions about {name} using the details on this site.`,
    `Call me Ask Jakub. I match your question to the site's data and answer from it.`, `I'm not a human and not ChatGPT, just a helper that reads this site's data.`,
    `I'm a retrieval assistant: I look up the best match for your question in {name}'s details.`, `Think of me as a smart search box with manners. I only talk about {name}.`,
    `I'm a bot, and I run entirely in your browser. No data leaves this page.`, `I'm Ask Jakub, here to tell you about {name}'s skills, projects and contact details.`,
    `Just a small assistant for {domain}. Ask me about {name}.`, `I'm the site's built-in assistant. I can't chat about everything, but I know {name}'s details well.`] },
  { id: 'help', test: /^\s*(help|help me)\s*[?!.]*\s*$|what can you (do|answer)|what (can|should) i ask|what do you know/, say: [
    `I can tell you about {name}'s skills, studies, work, projects, this site and how to contact him.`, `Try asking about his expertise, where he studied, what he's working on or how to reach him.`,
    `Ask me about {name}: skills, languages, education, projects, news, the Lab, or contact details.`, `I know about his background, his work and this site. Pick a topic below.`,
    `Questions about {name}'s projects, studies or contact details are my thing. Try one!`, `You can ask things like "What is his expertise?" or "How can I contact him?".`,
    `I cover his skills, education, experience, projects and links. Go ahead.`, `Anything about {name} that's on this site: ask and I'll look it up.`,
    `Start with a topic: skills, studies, projects, Lab or contact.`, `I answer questions about {name}. The chips below are good starting points.`] },
  { id: 'joke', test: /\b(joke|funny|make me laugh|something funny)\b/, say: [
    `Why do programmers prefer dark mode? Because light attracts bugs.`, `There are 10 types of people: those who understand binary and those who don't.`, `A SQL query walks into a bar, sees two tables and asks: can I join you?`,
    `Why did the developer go broke? He used up all his cache.`, `I would tell you a UDP joke, but you might not get it.`, `How many programmers does it take to change a light bulb? None, that's a hardware problem.`,
    `Why do Java developers wear glasses? Because they don't C#.`, `To understand recursion, you must first understand recursion.`, `It works on my machine. So we shipped my machine.`,
    `Why was the JavaScript developer sad? He didn't Node how to Express himself.`] },
  { id: 'compliment', test: /\b(nice|cool|awesome|great|amazing|love|impressive|beautiful|good) (site|website|work|job|design|page|assistant|bot)\b|\b(well done|good job|great job|nice one)\b/, say: [
    `Thank you! I'll pass that on to {name}.`, `That's kind of you to say.`, `Glad you like it! Want a tour of the Lab?`, `Thanks! There's a lot more to explore, like the terminal and the sorting visualizer.`,
    `Appreciate it! Ask me anything about {name}.`, `Thank you, that means a lot.`, `Happy you enjoy it. Try pressing Ctrl K for search.`, `Nice of you to say so!`, `Thanks! Have a look at the portfolio next.`, `Cheers! Anything you'd like to know about {name}?`] },
  { id: 'ack', test: /^\s*(ok(ay)?|cool|nice|great|got it|i see|alright|sure|yes|yeah|yep|no|nope|hmm+|wow)\s*[.!?]*\s*$/, say: [
    `Alright. Anything else?`, `Got it. What else can I tell you?`, `Sure. Ask me something else whenever you like.`, `Okay! More questions?`, `Cool. Want to hear about his projects?`, `Understood. What next?`,
    `I'm here if you think of something.`, `Great. What else would you like to know?`, `Fine by me. Shall we look at his skills?`, `Noted! Ask away.`] },
];

/* ---------- putting it together ---------- */
const UNKNOWN = [
  `I can only answer from the details {name} has added to this site, and I don't have that one. Try asking about his skills, studies, projects or how to contact him.`,
  `Hmm, that's not something I know about {name}. I'm better with questions about his skills, projects or contact details.`, `I don't have an answer for that. The site covers skills, education, projects and how to reach {name}.`,
  `That one's outside what I know. I can tell you about {name}'s background, projects or the Lab instead.`, `Sorry, I can't find that in {name}'s details. Want to try his expertise or projects?`,
  `I'm a small assistant, so I only know what's on this site. Ask me about {name}'s work or how to reach him.`, `No match for that. Pick one of the suggestions, or ask about {name}'s skills.`,
  `I couldn't connect that to anything on the site. Rephrase it, or try a topic like projects, studies or contact.`, `That's beyond what I have. {name}'s details are about skills, studies, work and projects.`,
  `Not sure about that one. I can help with {name}'s expertise, projects and contact details.`,
];

let memory = null;                         // remembers the last topic so "another one" / "tell me more" can say it differently
export const resetAssistant = () => { memory = null; lastPick.clear(); };

const reply = t => ({
  id: t.id, text: finish(fill(pick(t.id, t.openers), { ...vars(), ...t.vars })), sample: !!t.sample,
  actions: t.actions ? t.actions() : [], suggestions: t.next.map(n => QUESTIONS[n]),
});
const talk = t => ({ id: t.id, text: fill(pick(t.id, t.say), vars()), sample: false, actions: [], suggestions: randomQuestions(3) });
const unknown = () => ({ id: 'unknown', text: fill(pick('unknown', UNKNOWN), vars()), sample: false, actions: [{ label: 'Call Jakub', href: site.phone.href }], suggestions: randomQuestions(3) });

/* Returns { id, text, sample, actions, suggestions }, or null for an empty question */
export function answer(question) {
  const raw = question.trim();
  if (!raw) return null;
  const low = raw.toLowerCase();

  if (/^\s*(more|again|another( one)?|one more|rephrase|say (that )?again|tell me more|go on)\s*[.!?]*\s*$/.test(low))
    return memory ? memory() : talk(TALK.find(t => t.id === 'help'));
  const small = TALK.find(t => t.test.test(low));
  if (small) { memory = () => talk(small); return talk(small); }

  const q = { low, text: normalize(raw), stems: new Set(words(raw)) };
  const tops = topics();
  q.known = new Set(tops.flatMap(t => t.keys.split(' ').map(stem)));      // every word that already points at a topic
  const padded = ` ${q.text.replace(/\s+/g, ' ')} `;
  const hit = key => q.stems.has(key) || [...q.stems].some(s => within1(s, key));

  let best = null, top = 0;
  for (const t of tops) {
    const keys = [...new Set(t.keys.split(' ').map(stem))];
    const score = keys.filter(hit).length * 3 + t.phrases.filter(p => padded.includes(` ${p} `)).length * 6;
    if (score > top) { top = score; best = t; }
  }
  for (const t of specifics(q)) {
    const ids = t.words.filter(w => !GENERIC.has(w));
    const score = t.force || ids.filter(hit).length * 12;     // naming a specific item beats generic topic words
    if (score > top) { top = score; best = t; }
  }
  if (!best || top < 3) { memory = unknown; return unknown(); }
  const chosen = best;
  memory = () => reply(chosen);
  return reply(chosen);
}
