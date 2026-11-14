# jakubadam.com

Personal site built with React. No backend and no build step, so it runs for free on GitHub Pages.

## Publish it
1. Copy everything from this folder into the root of your `jakub-adam.github.io` repo (keep your existing `CNAME` file).
2. Add your photo as `images/profile.jpg`.
3. Commit and push. In the repo go to Settings > Pages and make sure it deploys from the `main` branch, root folder.

## Run it on your computer
Browsers block ES modules when you open a file directly, so use a tiny local server:
- VS Code: install the "Live Server" extension, right-click `index.html`, Open with Live Server, or
- Terminal: `npx serve` in this folder.

## Where things are
```
index.html            loads React from a CDN and starts src/main.js
styles/global.css     all styles; colors and fonts are the variables at the top
images/               your pictures
src/
  main.js             mounts the app
  App.js              page frame and routing: add new pages here
  data/site.js        ALL text, links, projects and posts: edit content here
  lib/                html.js (JSX-like helper), router.js, motion.js, sky.js (star and sun math), toast.js
  components/         small reusable pieces (Header, Menu, Footer, HeroName, Portrait = the dot-matrix photo,
                      NetworkCanvas = the sky panel, Meter = the tick meters, CommandPalette...)
  pages/              one file per screen (Home, Portfolio, ProjectDetail, About, News, PostDetail, Contact)
```

## The sky panel
The panel on the left is drawn for one place on Earth: `site.place` in `src/data/site.js` (a name, a latitude and a longitude).
In the dark theme it is a chart of the northern sky as it stands over that place right now; in the light theme it is today's path of the sun, with the sun where it actually is. The stars and constellations are listed in `src/lib/sky.js`.

## Projects
The first entry in `projects` is the "Latest project" on the home page. A project opens as a sheet over the portfolio list; besides the basics it can have a tagline, a "Live" badge, a link to the running project, a link to the source, a table of facts (`spec`) and a grid of short blocks (`parts`). The notes above `projects` in `src/data/site.js` list them all.

## How the code reads
Components are plain functions that return an `html` template, which works like JSX:
```js
export const Hello = ({ name }) => html`<p class="hi">Hello ${name}</p>`;
// use it inside another template:  html`<${Hello} name="Jakub" />`
```
Pages are reached with hash links: `#/about`, `#/portfolio/jakubadam-com`, `#/news/welcome`.

## Add a project or a post
Open `src/data/site.js` and copy one entry in `projects` or `posts`. Give it a new `slug`, and its page appears at `#/portfolio/<slug>` or `#/news/<slug>`.

## Still to fill in
Anything marked `// sample` in `src/data/site.js`, and the Discord link (paste it into the empty entry in `social`).
