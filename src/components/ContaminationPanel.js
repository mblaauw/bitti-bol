import { html } from '../htm.js';
import { songLyrics, scanHits, hoveredHit, scheduleScan } from '../state.js';

export function ContaminationPanel() {
  const hits = scanHits.value;
  if (!hits.length && !songLyrics.value) return html`
    <div class="card" style="padding:26px 20px;text-align:center">
      <div class="panel-title" style="color:var(--text-muted)">Dialect scan</div>
      <div style="font-size:11.5px;color:#b0a48f;margin-top:7px;line-height:1.5">Results appear after<br/>generation.</div>
    </div>
  `;
  const highCount = hits.filter(h => h.severity === 'high').length;
  const medCount = hits.length - highCount;
  let badgeBg = 'var(--success-soft)', badgeFg = 'var(--success)', badgeLabel = 'clean';
  if (highCount > 0) { badgeBg = 'var(--accent-soft)'; badgeFg = 'var(--accent)'; badgeLabel = highCount + ' high'; }
  else if (medCount > 0) { badgeBg = 'var(--warn-soft)'; badgeFg = 'var(--warn-fg)'; badgeLabel = medCount + ' medium'; }
  const hovered = hoveredHit.value;
  const fixAll = () => {
    const sorted = [...hits].sort((a, b) => (b.lineNo - a.lineNo) || (b.col - a.col));
    const lns = songLyrics.value.split('\n');
    for (const h of sorted) {
      const idx = h.lineNo - 1;
      if (idx >= 0 && idx < lns.length) {
        const l = lns[idx];
        lns[idx] = l.slice(0, h.col) + h.suggestion + l.slice(h.col + h.match.length);
      }
    }
    songLyrics.value = lns.join('\n');
    scheduleScan(songLyrics.value);
  };
  return html`
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:16px 18px;border-bottom:1px solid var(--border-light)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h2 class="panel-title">Dialect scan</h2>
          <div style="display:flex;align-items:center;gap:8px">
            ${hits.length > 1 ? html`<button onClick=${fixAll} style="font-size:11px;font-weight:600;padding:4px 11px;border:1px solid #d3c6a8;background:#fff;color:var(--warn-fg);border-radius:var(--radius-sm);cursor:pointer">Fix all (${hits.length})</button>` : ''}
            <span class="badge" style="background:${badgeBg};color:${badgeFg}">${badgeLabel}</span>
          </div>
        </div>
        <p style="font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.5">Flags Hindi / Punjabi words that break Pahari authenticity. Hover a hit to find it in the lyrics.</p>
      </div>
      ${hits.length === 0 ? html`
        <div style="padding:30px 18px;text-align:center">
          <div style="width:42px;height:42px;border-radius:50%;background:var(--success-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><span style="color:var(--success);font-size:21px;font-weight:700">✓</span></div>
          <div style="font-size:13.5px;font-weight:600;color:var(--success)">Reads as authentic Pahari</div>
          <div style="font-size:11.5px;color:var(--text-dim);margin-top:4px">No Hindi or Punjabi drift detected</div>
        </div>
      ` : html`
        <div style="padding:12px;display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 210px);overflow-y:auto">
          ${hits.map((h, i) => {
            const hi = h.severity === 'high';
            const on = i === hovered;
            const accent = hi ? '#c0472a' : '#a9791a';
            return html`
              <div class="hit-card" onMouseEnter=${() => hoveredHit.value = i} onMouseLeave=${() => hoveredHit.value = null} style="border-color:${on ? accent : 'var(--border-light)'};border-left:3px solid ${accent};box-shadow:${on ? '0 2px 8px rgba(58,49,40,.08)' : 'none'}">
                <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px">
                  <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--ink)">${h.match}</span>
                  <span style="font-family:var(--mono);font-size:9px;letter-spacing:.04em;text-transform:uppercase;font-weight:600;color:#fff;background:${accent};padding:1px 6px;border-radius:4px">${h.language}</span>
                  <span style="font-family:var(--mono);font-size:10px;color:#b0a48f;margin-left:auto">line ${h.lineNo}</span>
                </div>
                <div style="font-size:11px;color:var(--text-soft);line-height:1.4;font-family:var(--mono)">${h.line.length > 54 ? h.line.slice(0, 54) + '…' : h.line}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px">
                  <span style="font-size:12px;color:var(--success);font-family:var(--mono)">→ ${h.suggestion}</span>
                  <button onClick=${() => { const lns = songLyrics.value.split('\n'); const idx = h.lineNo - 1; if (idx >= 0 && idx < lns.length) { const l = lns[idx]; lns[idx] = l.slice(0, h.col) + h.suggestion + l.slice(h.col + h.match.length); songLyrics.value = lns.join('\n'); scheduleScan(songLyrics.value); } }} style="flex-shrink:0;font-size:11px;font-weight:600;padding:4px 11px;border:1px solid #d3c6a8;background:#fff;color:var(--warn-fg);border-radius:var(--radius-sm);cursor:pointer">Apply fix</button>
                </div>
              </div>
            `;
          })}
        </div>
      `}
    </div>
  `;
}
