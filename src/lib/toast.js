/* A short message at the bottom of the screen that goes away on its own, for example "Copied". */
let timer = 0;
export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('on'));
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('on'), 1800);
}

/* Copies text and says so */
export const copy = (text, what) => {
  const done = () => toast(`Copied ${what}`);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast(`Could not copy. ${text}`));
  else toast(`Could not copy. ${text}`);
};
