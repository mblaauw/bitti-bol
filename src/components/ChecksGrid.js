import { html } from '../htm.js';
import { songReport } from '../state.js';
export function ChecksGrid() {
  const rep = songReport.value;
  if (!rep) return null;
  const mech = rep.mechanical;
  const critic = rep.critic;
  const repair = rep.repair;
  const mechWarnings = (mech && mech.warnings || []).map(w => ({
    message: w.message,
    dotStyle: 'flex-shrink:0;width:7px;height:7px;border-radius:50%;margin-top:5px;background:' + (w.severity === 'high' ? '#c0472a' : '#a9791a'),
  }));
  const criticIssues = (critic && critic.issues || []).slice(0, 4).map(iss => ({ text: (iss.excerpt ? iss.excerpt + ' \u2014 ' : '') + (iss.problem || '') + (iss.suggestion ? ' \u2192 ' + iss.suggestion : '') }));
  const criticVerdict = critic ? (critic.is_authentic ? '\u2713 Authentic \u00b7 confidence ' + (critic.confidence || 0).toFixed(2) : '\u2717 Issues found \u00b7 confidence ' + (critic.confidence || 0).toFixed(2)) : '';
  return html`
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px">Checks</div>
      <div class="chk-grid">
        <div style="background:var(--bg-soft);border:1px solid var(--border-light);border-radius:9px;padding:12px 14px">
          <div style="font-size:11px;font-weight:600;color:#6b6152;margin-bottom:7px">Suno structure</div>
          ${mechWarnings.length === 0 ? html`<div style="font-size:12.5px;color:#4f7a3f;display:flex;align-items:center;gap:6px"><span style="font-weight:700">\u2713</span> All mechanical checks passed</div>` : html`
            <div style="display:flex;flex-direction:column;gap:6px">${mechWarnings.map(w => html`<div style="display:flex;gap:7px;font-size:11.5px;line-height:1.45;color:#5e5344"><span style="${w.dotStyle}"></span><span>${w.message}</span></div>`)}</div>
          `}
        </div>
        <div style="background:var(--bg-soft);border:1px solid var(--border-light);border-radius:9px;padding:12px 14px">
          <div style="font-size:11px;font-weight:600;color:#6b6152;margin-bottom:7px">LLM critic</div>
          ${critic ? html`
            <div style="font-size:12.5px;font-weight:600;color:${critic.is_authentic ? '#4f7a3f' : '#c0472a'}">${criticVerdict}</div>
            ${criticIssues.map(iss => html`<div style="font-size:11px;color:#8a7d68;margin-top:5px;line-height:1.4">\u00b7 ${iss.text}</div>`)}
          ` : html`<div style="font-size:12px;color:#b0a48f">Not run for this song.</div>`}
          ${repair && repair.applied ? html`<div style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-light);font-size:11.5px;color:#4f7a3f">Repair applied \u00b7 high hits ${repair.beforeHigh} \u2192 ${repair.afterHigh}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}
