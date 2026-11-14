import { useState, useEffect } from './html.js';

/* Hash routing (#/about, #/portfolio/my-project) works on GitHub Pages with no server setup */
const read = () => {
  const [page = 'home', id = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { page, id };
};

export const link = (...parts) => '#/' + parts.join('/');
export const navigate = (...parts) => { location.hash = '/' + parts.join('/'); };

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    /* A new page starts at the top. Opening or closing a project sheet or a news entry keeps your place. */
    let page = read().page;
    const onChange = () => { const next = read(); if (next.page !== page) scrollTo(0, 0); page = next.page; setRoute(next); };
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
