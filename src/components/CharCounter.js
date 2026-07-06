import { html } from '../htm.js';
export function CharCounter({ text, limit }) {
  const len = (text || '').length;
  const cls = len > limit ? 'over' : len > limit * 0.9 ? 'warn' : 'ok';
  return html`<span class="char-count ${cls}">${len} / ${limit}</span>`;
}
