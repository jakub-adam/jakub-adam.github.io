import { html } from '../lib/html.js';
import { Assistant } from '../lab/Assistant.js';
import { Terminal } from '../lab/Terminal.js';
import { SortViz } from '../lab/SortViz.js';
import { Segmented } from '../components/Segmented.js';
import { labTools } from '../data/site.js';
import { link } from '../lib/router.js';

/* Add a tool: write a component in src/lab, list it in labTools (src/data/site.js) and here. */
const TOOLS = { assistant: Assistant, terminal: Terminal, sorting: SortViz };
const SHORT = { sorting: 'Sorting' };   // shorter names for the small switch

/* Sub screens: #/lab/assistant, #/lab/terminal, #/lab/sorting
   The page is built to fit the screen: the heading and the switch share one row and the tool fills the rest. */
export function Lab({ id }) {
  const found = labTools.findIndex(t => t[0] === id);
  const index = found < 0 ? 0 : found;
  const [toolId, , desc] = labTools[index];
  const Tool = TOOLS[toolId];
  return html`<div class="labpage" data-tool=${toolId}>
    <div class="lab-top">
      <h1 class="title">Lab</h1>
      <${Segmented} label="Lab tools" index=${index} items=${labTools.map(([tid, label]) => ({ id: tid, label: SHORT[tid] || label, href: link('lab', tid) }))} />
    </div>
    <p class="intro lab-intro">Small tools written in plain JavaScript, running right here in your browser.</p>
    <p class="note">${desc}</p>
    <div class="tool"><${Tool} key=${toolId} /></div>
  </div>`;
}
