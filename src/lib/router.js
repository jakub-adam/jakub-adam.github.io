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
    const onChange = () => { setRoute(read()); scrollTo(0, 0); };
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
