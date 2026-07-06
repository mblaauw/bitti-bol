import { html } from '../htm.js';
import { songLyrics, scanHits, hoveredHit } from '../state.js';
import { segmentLyrics } from '../core/index.js';
export function LyricsReadMode() {
  if (!songLyrics.value) return null;
  const segs = segmentLyrics(songLyrics.value, scanHits.value);
  const hovered = hoveredHit.value;
  return html`
    <div style="padding:22px 26px;font-family:var(--mono);font-size:13px;line-height:1.9;color:#33291f;background:linear-gradient(var(--bg-card),var(--bg-card))">
      ${segs.map(ln => {
        if (ln.type === 'tag') return html`<div style="display:flex;align-items:center;gap:10px;margin:16px 0 6px"><span style="font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);white-space:nowrap">${ln.text}</span><span style="flex:1;height:1px;background:#e8dfce"></span></div>`;
        if (ln.type === 'blank') return html`<div style="height:10px"></div>`;
        return html`<div style="min-height:1.9em">${ln.segments.map(sg => {
          if (!sg.hit) return html`<span>${sg.text}</span>`;
          const hi = sg.severity === 'high';
          const on = sg.idx === hovered;
          const uc = hi ? '#c0472a' : '#a9791a';
          const bg = on ? (hi ? '#f0c6b7' : '#ecd6a4') : (hi ? '#f7ddd3' : '#f4e8cc');
          return html`<mark onMouseEnter=${() => hoveredHit.value = sg.idx} onMouseLeave=${() => hoveredHit.value = null} style="background:${bg};border-bottom:2px solid ${uc};border-radius:3px;padding:0 2px;cursor:pointer;color:#26211a;box-shadow:${on ? '0 0 0 2px ' + uc : 'none'};transition:background .12s,box-shadow .12s">${sg.text}</mark>`;
        })}</div>`;
      })}
    </div>
  `;
}
