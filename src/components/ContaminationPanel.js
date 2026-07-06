import { html } from '../htm.js';
import { songLyrics, scanHits, hoveredHit } from '../state.js';
import { applyReplacement } from '../core/index.js';
import { scheduleScan } from '../state.js';
export function ContaminationPanel() {
  const hits = scanHits.value;
  if (!hits.length && !songLyrics.value) return html`
    <section style="grid-area:scan;min-width:0">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;position:sticky;top:92px;padding:26px 18px;text-align:center">
        <div style="font-size:13px;font-weight:600;color:#b0a48f">Dialect scan</div>
        <div style="font-size:11.5px;color:#b0a48f;margin-top:6px">Results appear after generation.</div>
      </div>
    </section>
  `;
  const highCount = hits.filter(h => h.severity === 'high').length;
  const medCount = hits.length - highCount;
  let badgeBg = '#e6efdd', badgeFg = '#4f7a3f', badgeLabel = 'clean';
  if (highCount > 0) { badgeBg = '#f6e0d9'; badgeFg = '#c0472a'; badgeLabel = highCount + ' high'; }
  else if (medCount > 0) { badgeBg = '#f5ecd3'; badgeFg = '#8a6d1a'; badgeLabel = medCount + ' medium'; }
  const hovered = hoveredHit.value;
  return html`
    <section style="grid-area:scan;min-width:0">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;position:sticky;top:92px">
        <div style="padding:16px 18px;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h2 style="font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#26211a">Dialect scan</h2>
            <span style="font-family:var(--mono);font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:600;padding:3px 9px;border-radius:20px;background:${badgeBg};color:${badgeFg}">${badgeLabel}</span>
          </div>
          <p style="font-size:11px;color:var(--text-dim);margin-top:5px;line-height:1.45">Flags Hindi / Punjabi words that break Pahari authenticity. Hover a hit to find it in the lyrics.</p>
        </div>
        ${hits.length === 0 ? html`
          <div style="padding:26px 18px;text-align:center">
            <div style="width:38px;height:38px;border-radius:50%;background:#e6efdd;display:flex;align-items:center;justify-content:center;margin:0 auto 10px"><span style="color:#4f7a3f;font-size:19px;font-weight:700">\u2713</span></div>
            <div style="font-size:13px;font-weight:600;color:#4f7a3f">Reads as authentic Pahari</div>
            <div style="font-size:11.5px;color:var(--text-dim);margin-top:3px">No Hindi or Punjabi drift detected</div>
          </div>
        ` : html`
          <div style="padding:12px;display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 260px);overflow-y:auto">
            ${hits.map((h, i) => {
              const hi = h.severity === 'high';
              const on = i === hovered;
              const accent = hi ? '#c0472a' : '#a9791a';
              return html`
                <div onMouseEnter=${() => hoveredHit.value = i} onMouseLeave=${() => hoveredHit.value = null} style="border:1px solid ${on ? accent : 'var(--border-light)'};border-left:3px solid ${accent};border-radius:8px;padding:9px 11px;background:${on ? '#fff' : 'var(--bg-soft)'};transition:border-color .12s,background .12s">
                  <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px">
                    <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:#26211a">${h.match}</span>
                    <span style="font-family:var(--mono);font-size:9px;letter-spacing:.04em;text-transform:uppercase;font-weight:600;color:#fff;background:${accent};padding:1px 6px;border-radius:4px">${h.language}</span>
                    <span style="font-family:var(--mono);font-size:10px;color:#b0a48f">line ${h.lineNo}</span>
                  </div>
                  <div style="font-size:11px;color:var(--text-soft);line-height:1.4;font-family:var(--mono)">${h.line.length > 54 ? h.line.slice(0, 54) + '\u2026' : h.line}</div>
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px">
                    <span style="font-size:12px;color:#4f7a3f;font-family:var(--mono)">\u2192 ${h.suggestion}</span>
                    <button onClick=${() => { songLyrics.value = applyReplacement(songLyrics.value, h.pattern, h.suggestion, h.lineNo, h.col); scheduleScan(songLyrics.value); }} style="flex-shrink:0;font-size:11px;font-weight:600;padding:4px 11px;border:1px solid #d3c6a8;background:#fff;color:var(--warn-fg);border-radius:6px;cursor:pointer">Apply fix</button>
                  </div>
                </div>
              `;
            })}
          </div>
        `}
      </div>
    </section>
  `;
}
