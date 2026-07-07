import { html } from '../htm.js';
import { songLyrics, scanHits, hoveredHit } from '../state.js';
import { segmentLyrics } from '../core/index.js';

const STRUCTURAL = /^\[\s*(intro|verse|chorus|pre[-\s]?chorus|bridge|outro|hook|refrain|interlude|coda|ending|end)\b/i;
function isChorus(text) { return /^\[\s*chorus/i.test(text || ''); }

export function LyricsReadMode() {
  if (!songLyrics.value) return null;
  const segs = segmentLyrics(songLyrics.value, scanHits.value);
  const hovered = hoveredHit.value;
  let section = '';
  let firstContent = true;

  return html`
    <div class="lyrics-sheet">
      ${segs.map(ln => {
        if (ln.type === 'tag') {
          if (STRUCTURAL.test(ln.text)) {
            section = isChorus(ln.text) ? 'chorus' : 'other';
            const label = ln.text.replace(/^\[|\]$/g, '');
            return html`<div class="ly-section"><span class="ly-sec-label">${label}</span><span class="ly-sec-rule"></span></div>`;
          }
          // performance / vocal direction tag
          return html`<div class="ly-line"><span class="ly-perf">${ln.text}</span></div>`;
        }
        if (ln.type === 'blank') return html`<div class="ly-blank"></div>`;
        const cls = 'ly-line' + (section === 'chorus' ? ' ly-chorus-line' : '') + (firstContent ? ' first' : '');
        firstContent = false;
        return html`<div class="${cls}">${ln.segments.map(sg => {
          if (!sg.hit) return html`<span>${sg.text}</span>`;
          const hi = sg.severity === 'high';
          const on = sg.idx === hovered;
          const uc = hi ? '#c0472a' : '#a9791a';
          const bg = on ? (hi ? '#f0c6b7' : '#ecd6a4') : (hi ? '#f7ddd3' : '#f4e8cc');
          return html`<mark class="ly-hit" onMouseEnter=${() => hoveredHit.value = sg.idx} onMouseLeave=${() => hoveredHit.value = null} style="background:${bg};border-bottom:2px solid ${uc};box-shadow:${on ? '0 0 0 2px ' + uc : 'none'}">${sg.text}</mark>`;
        })}</div>`;
      })}
    </div>
  `;
}
