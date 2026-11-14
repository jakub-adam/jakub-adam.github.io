import { html, useState, useEffect, useMemo } from '../lib/html.js';
import { NetworkCanvas } from './NetworkCanvas.js';
import { HeroName } from './HeroName.js';
import { site } from '../data/site.js';
import { sunDay, siderealTime, clock, coordText } from '../lib/sky.js';

const two = n => String(n).padStart(2, '0');

/* The panel on the left: a sky instrument drawn by NetworkCanvas.js (a star chart in the dark theme,
   a sun chart in the light theme) with a few live readings on top of it: the coordinates it is
   drawn for, the visitor's clock, and one line of data about tonight's sky or today's sun.
   Your name sits at the bottom. On phones the panel is the top of the home page only. */
export function Panel({ page }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { name, lat, lon } = site.place;
  const sun = useMemo(() => sunDay(now, lat, lon), [now.toDateString()]);
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`;

  return html`
    <div class="panel">
      <${NetworkCanvas} />
      <div class="sky-ui">
        <div class="sky-top">
          <p><b>${coordText(lat, 'N', 'S')}  ${coordText(lon, 'E', 'W')}</b><span>${name}</span></p>
          <p class="sky-clock"><b>${time}</b><span>Local time</span></p>
        </div>
        <div class="sky-copy">
          <${HeroName} lines=${site.name.split(' ')} heading=${page === 'home'} />
          <p class="sky-lead">${site.lead}</p>
          <p class="sky-foot at-night"><span>North circumpolar · J2000</span><span>Sidereal ${clock(siderealTime(now, lon) * 60)}</span></p>
          <p class="sky-foot at-day"><span>Sun path · ${date}</span><span>Day ${Math.floor(sun.length / 60)} h ${two(Math.round(sun.length % 60))} m</span></p>
        </div>
      </div>
    </div>`;
}
