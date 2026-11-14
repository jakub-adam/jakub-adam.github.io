/* The small amount of astronomy behind the sky panel (see components/NetworkCanvas.js).
   Everything here is plain math on dates and angles: no network, no libraries.
   Accuracy is "naked eye": a fraction of a degree, which is far finer than a pixel on the panel. */

const RAD = Math.PI / 180;
const wrap = (v, n) => ((v % n) + n) % n;

/* ---------- time ---------- */
const daysSince2000 = date => date / 86400000 + 2440587.5 - 2451545.0;

/* Local sidereal time in hours: which right ascension is due south right now */
export const siderealTime = (date, lon) => wrap(18.697374558 + 24.06570982441908 * daysSince2000(date) + lon / 15, 24);

/* How high something is above the horizon (alt) and its compass direction (az, 0 = north, 90 = east), in degrees.
   ra in hours, dec in degrees, lst in hours. */
export function altAz(ra, dec, lst, lat) {
  const H = (lst - ra) * 15 * RAD, d = dec * RAD, p = lat * RAD;
  const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(p) - Math.tan(d) * Math.cos(p)) / RAD + 180;
  return { alt: alt / RAD, az: wrap(az, 360) };
}

/* ---------- the sun ---------- */
export function sunPosition(date) {
  const n = daysSince2000(date);
  const g = wrap(357.528 + 0.9856003 * n, 360) * RAD;
  const lambda = (wrap(280.460 + 0.9856474 * n, 360) + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;
  return {
    ra: wrap(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / RAD, 360) / 15,
    dec: Math.asin(Math.sin(eps) * Math.sin(lambda)) / RAD,
  };
}

export const sunNow = (date, lat, lon) => {
  const s = sunPosition(date);
  return altAz(s.ra, s.dec, siderealTime(date, lon), lat);
};

/* The sun's whole path for the local day of "date": a point every 5 minutes, plus sunrise,
   sunset and the highest point (as minutes after local midnight, or null if it never happens). */
export function sunDay(date, lat, lon) {
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const HORIZON = -0.833;   // the sun counts as risen when its upper edge clears the horizon
  const points = [];
  let rise = null, set = null, noon = 0, top = -90;
  for (let m = 0; m <= 1440; m += 5) {
    const p = sunNow(new Date(start.getTime() + m * 60000), lat, lon);
    const prev = points[points.length - 1];
    if (prev) {
      const cross = (HORIZON - prev.alt) / (p.alt - prev.alt);
      if (prev.alt < HORIZON && p.alt >= HORIZON) rise = { m: prev.m + cross * 5, az: prev.az + cross * (p.az - prev.az) };
      if (prev.alt >= HORIZON && p.alt < HORIZON) set = { m: prev.m + cross * 5, az: prev.az + cross * (p.az - prev.az) };
    }
    if (p.alt > top) { top = p.alt; noon = m; }
    points.push({ m, alt: p.alt, az: p.az });
  }
  return { points, rise, set, noon, top, length: rise && set ? set.m - rise.m : top > 0 ? 1440 : 0 };
}

/* ---------- text ---------- */
const two = n => String(Math.floor(n)).padStart(2, '0');
export const clock = minutes => two(minutes / 60) + ':' + two(minutes % 60);
export const raText = ra => `${two(ra)}h ${two((ra % 1) * 60)}m`;
export const decText = dec => `${dec < 0 ? '-' : '+'}${two(Math.abs(dec))}° ${two((Math.abs(dec) % 1) * 60)}′`;
export const coordText = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v < 0 ? neg : pos}`;

/* ---------- the stars ----------
   The brightest stars of the northern sky: id: [right ascension (hours), declination (degrees), magnitude, name, designation].
   Positions are J2000. Add a star here and use its id in FIGURES to draw a new constellation. */
export const STARS = {
  polaris: [2.530, 89.26, 2.0, 'Polaris', 'α UMi'], yildun: [17.537, 86.59, 4.4, 'Yildun', 'δ UMi'], epsUMi: [16.766, 82.04, 4.2, '', 'ε UMi'],
  zetUMi: [15.734, 77.79, 4.3, '', 'ζ UMi'], kochab: [14.845, 74.16, 2.1, 'Kochab', 'β UMi'], pherkad: [15.345, 71.83, 3.0, 'Pherkad', 'γ UMi'], etaUMi: [16.292, 75.76, 5.0, '', 'η UMi'],

  dubhe: [11.062, 61.75, 1.8, 'Dubhe', 'α UMa'], merak: [11.031, 56.38, 2.4, 'Merak', 'β UMa'], phecda: [11.897, 53.69, 2.4, 'Phecda', 'γ UMa'], megrez: [12.257, 57.03, 3.3, 'Megrez', 'δ UMa'],
  alioth: [12.900, 55.96, 1.8, 'Alioth', 'ε UMa'], mizar: [13.399, 54.93, 2.2, 'Mizar', 'ζ UMa'], alkaid: [13.792, 49.31, 1.9, 'Alkaid', 'η UMa'],
  muscida: [8.505, 60.72, 3.4, 'Muscida', 'ο UMa'], talitha: [8.987, 48.04, 3.1, 'Talitha', 'ι UMa'], taniaB: [10.285, 42.91, 3.5, 'Tania Borealis', 'λ UMa'], psiUMa: [11.161, 44.50, 3.0, '', 'ψ UMa'],

  caph: [0.153, 59.15, 2.3, 'Caph', 'β Cas'], schedar: [0.675, 56.54, 2.2, 'Schedar', 'α Cas'], navi: [0.945, 60.72, 2.5, 'Navi', 'γ Cas'], ruchbah: [1.430, 60.24, 2.7, 'Ruchbah', 'δ Cas'], segin: [1.907, 63.67, 3.4, 'Segin', 'ε Cas'],

  alderamin: [21.310, 62.59, 2.5, 'Alderamin', 'α Cep'], alfirk: [21.478, 70.56, 3.2, 'Alfirk', 'β Cep'], errai: [23.656, 77.63, 3.2, 'Errai', 'γ Cep'], iotCep: [22.828, 66.20, 3.5, '', 'ι Cep'], zetCep: [22.181, 58.20, 3.4, '', 'ζ Cep'],

  giausar: [11.523, 69.33, 3.8, 'Giausar', 'λ Dra'], kapDra: [12.558, 69.79, 3.9, '', 'κ Dra'], thuban: [14.073, 64.38, 3.7, 'Thuban', 'α Dra'], edasich: [15.415, 58.97, 3.3, 'Edasich', 'ι Dra'],
  theDra: [16.031, 58.57, 4.0, '', 'θ Dra'], etaDra: [16.400, 61.51, 2.7, 'Athebyne', 'η Dra'], zetDra: [17.146, 65.71, 3.2, 'Aldhibah', 'ζ Dra'], altais: [19.209, 67.66, 3.1, 'Altais', 'δ Dra'],
  grumium: [17.892, 56.87, 3.7, 'Grumium', 'ξ Dra'], eltanin: [17.943, 51.49, 2.2, 'Eltanin', 'γ Dra'], rastaban: [17.507, 52.30, 2.8, 'Rastaban', 'β Dra'], nuDra: [17.537, 55.18, 4.9, '', 'ν Dra'],

  deneb: [20.690, 45.28, 1.3, 'Deneb', 'α Cyg'], sadr: [20.370, 40.26, 2.2, 'Sadr', 'γ Cyg'], gienah: [20.770, 33.97, 2.5, 'Gienah', 'ε Cyg'], delCyg: [19.750, 45.13, 2.9, 'Fawaris', 'δ Cyg'], albireo: [19.512, 27.96, 3.1, 'Albireo', 'β Cyg'],
  vega: [18.616, 38.78, 0.0, 'Vega', 'α Lyr'], sheliak: [18.835, 33.36, 3.5, 'Sheliak', 'β Lyr'], sulafat: [18.982, 32.69, 3.2, 'Sulafat', 'γ Lyr'],
  mirfak: [3.405, 49.86, 1.8, 'Mirfak', 'α Per'], algol: [3.136, 40.96, 2.1, 'Algol', 'β Per'],
  capella: [5.278, 46.00, 0.1, 'Capella', 'α Aur'], menkalinan: [5.992, 44.95, 1.9, 'Menkalinan', 'β Aur'], elnath: [5.438, 28.61, 1.7, 'Elnath', 'β Tau'],
  almach: [2.065, 42.33, 2.1, 'Almach', 'γ And'], mirach: [1.162, 35.62, 2.1, 'Mirach', 'β And'], alpheratz: [0.140, 29.09, 2.1, 'Alpheratz', 'α And'],
  castor: [7.577, 31.89, 1.6, 'Castor', 'α Gem'], pollux: [7.755, 28.03, 1.1, 'Pollux', 'β Gem'],
  arcturus: [14.261, 19.18, -0.05, 'Arcturus', 'α Boo'], izar: [14.750, 27.07, 2.4, 'Izar', 'ε Boo'], seginus: [14.535, 38.31, 3.0, 'Seginus', 'γ Boo'], nekkar: [15.032, 40.39, 3.5, 'Nekkar', 'β Boo'],
  alphecca: [15.578, 26.71, 2.2, 'Alphecca', 'α CrB'], corCaroli: [12.934, 38.32, 2.9, 'Cor Caroli', 'α CVn'],
};

/* Constellations as line art: each line is a chain of star ids */
export const FIGURES = [
  { name: 'Ursa Minor', lines: [['polaris', 'yildun', 'epsUMi', 'zetUMi', 'kochab', 'pherkad', 'etaUMi', 'zetUMi']] },
  { name: 'Ursa Major', lines: [['dubhe', 'merak', 'phecda', 'megrez', 'dubhe'], ['megrez', 'alioth', 'mizar', 'alkaid']] },
  { name: 'Cassiopeia', lines: [['caph', 'schedar', 'navi', 'ruchbah', 'segin']] },
  { name: 'Cepheus', lines: [['alderamin', 'alfirk', 'errai', 'iotCep', 'zetCep', 'alderamin'], ['alfirk', 'iotCep']] },
  { name: 'Draco', lines: [['giausar', 'kapDra', 'thuban', 'edasich', 'theDra', 'etaDra', 'zetDra', 'altais', 'grumium', 'eltanin', 'rastaban', 'nuDra', 'grumium']] },
  { name: 'Cygnus', lines: [['deneb', 'sadr', 'albireo'], ['delCyg', 'sadr', 'gienah']] },
  { name: 'Lyra', lines: [['vega', 'sheliak', 'sulafat', 'vega']] },
  { name: 'Perseus', lines: [['mirfak', 'algol']] },
  { name: 'Auriga', lines: [['capella', 'menkalinan']] },
  { name: 'Andromeda', lines: [['alpheratz', 'mirach', 'almach']] },
  { name: 'Gemini', lines: [['castor', 'pollux']] },
  { name: 'Boötes', lines: [['arcturus', 'izar', 'nekkar', 'seginus', 'arcturus']] },
];

/* Stars that get their name written next to them, and the ones the readout visits when nobody is pointing */
export const NAMED = ['polaris', 'vega', 'capella', 'arcturus', 'deneb'];
export const TOUR = ['dubhe', 'kochab', 'vega', 'schedar', 'capella', 'alkaid', 'deneb', 'eltanin', 'mizar', 'alderamin'];

/* Faint background stars. They are random but always the same (a fixed seed), so the sky does not change between visits. */
export const FIELD = (() => {
  let seed = 20261114;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const low = Math.sin(-12 * RAD);
  return Array.from({ length: 520 }, () => ({
    ra: rnd() * 24,
    dec: Math.asin(low + rnd() * (1 - low)) / RAD,   // spread evenly over the sphere, not bunched at the pole
    mag: 4.2 + rnd() * rnd() * 2.6,
    phase: rnd() * Math.PI * 2,
    pace: 0.4 + rnd() * 1.2,
  }));
})();
