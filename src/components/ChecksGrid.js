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
    dotStyle: 'flex-shrink:0;width:7px;height:7px;border-radius:50%;margin-top:6px;background:' + (w.severity === 'high' ? '#c0472a' : '#a9791a'),
  }));
  const criticIssues = (critic && critic.issues || []).slice(0, 4).map(iss => ({ text: (iss.excerpt ? iss.excerpt + ' — ' : '') + (iss.problem || '') + (iss.suggestion ? ' → ' + iss.suggestion : '') }));
  const criticVerdict = critic ? (critic.is_authentic ? '✓ Authentic · confidence ' + (critic.confidence || 0).toFixed(2) : '✗ Issues found · confidence ' + (critic.confidence || 0).toFixed(2)) : '';
  return html`
    <div class="card" style="padding:20px 22px">
      <div class="eyebrow" style="margin-bottom:14px">Checks</div>
      <div class="chk-grid">
        <div style="background:var(--bg-soft);border:1px solid var(--border-light);border-radius:var(--radius);padding:14px 16px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.02em;color:#6b6152;margin-bottom:9px;text-transform:uppercase">Suno structure</div>
          ${mechWarnings.length === 0 ? html`<div style="font-size:12.5px;color:var(--success);display:flex;align-items:center;gap:6px"><span style="font-weight:700">✓</span> All mechanical checks passed</div>` : html`
            <div style="display:flex;flex-direction:column;gap:7px">${mechWarnings.map(w => html`<div style="display:flex;gap:8px;font-size:11.5px;line-height:1.45;color:#5e5344"><span style="${w.dotStyle}"></span><span>${w.message}</span></div>`)}</div>
          `}
        </div>
        <div style="background:var(--bg-soft);border:1px solid var(--border-light);border-radius:var(--radius);padding:14px 16px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.02em;color:#6b6152;margin-bottom:9px;text-transform:uppercase">LLM critic</div>
          ${critic ? html`
            <div style="font-size:12.5px;font-weight:600;color:${critic.is_authentic ? 'var(--success)' : 'var(--accent)'}">${criticVerdict}</div>
            ${criticIssues.map(iss => html`<div style="font-size:11px;color:#8a7d68;margin-top:6px;line-height:1.4">· ${iss.text}</div>`)}
          ` : html`<div style="font-size:12px;color:#b0a48f">Not run for this song.</div>`}
          ${repair && repair.applied ? html`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-light);font-size:11.5px;color:var(--success)">Repair applied · high hits ${repair.beforeHigh} → ${repair.afterHigh}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}
