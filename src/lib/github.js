/* Loads your public repositories straight from the GitHub API in the visitor's browser.
   No backend and no token needed. Results are cached for 10 minutes to stay under the rate limit. */
const TTL = 10 * 60 * 1000;

export async function fetchRepos(user) {
  const key = 'gh-repos:' + user;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (cached && Date.now() - cached.time < TTL) return cached.data;
  } catch (e) {}

  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
  if (res.status === 403) throw new Error('GitHub rate limit reached. Try again in a few minutes.');
  if (!res.ok) throw new Error('Could not load repositories (error ' + res.status + ').');

  const data = (await res.json()).filter(r => !r.fork).map(r => ({
    name: r.name, url: r.html_url, description: r.description, language: r.language,
    stars: r.stargazers_count, updated: r.pushed_at,
  }));
  try { sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data })); } catch (e) {}
  return data;
}

/* "3 days ago" from an ISO date */
export function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso)) / 1000;
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, size] of units) {
    if (seconds >= size) { const n = Math.floor(seconds / size); return `${n} ${name}${n > 1 ? 's' : ''} ago`; }
  }
  return 'just now';
}
