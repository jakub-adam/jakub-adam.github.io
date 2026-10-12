import { html } from '../lib/html.js';

const C = 213.6; // circle length for r=34 (2 * pi * 34)

export const Ring = ({ name, value, color }) => html`
  <div class="ring">
    <svg viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle cx="40" cy="40" r="34" fill="none" stroke=${`var(${color})`} strokeWidth="4" strokeLinecap="round"
        transform="rotate(-90 40 40)" style=${{ strokeDasharray: C, strokeDashoffset: C * (1 - value / 100) }} />
      <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">${value}%</text>
    </svg>${name}
  </div>`;
