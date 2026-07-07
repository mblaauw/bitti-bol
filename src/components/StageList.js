import { html } from '../htm.js';
import { pipelineSteps, STAGES } from '../state.js';

export function StageList() {
  const sts = pipelineSteps.value;
  const pal = (status) => {
    const m = {
      idle:    { dot: '#ece4d3', ring: 'transparent', ic: '#b0a48f', label: '#a89a84', sub: '#c0b39c' },
      active:  { dot: 'var(--accent)', ring: 'var(--accent-soft)', ic: '#fff', label: 'var(--ink)', sub: 'var(--accent)' },
      done:    { dot: 'var(--success)', ring: 'transparent', ic: '#fff', label: 'var(--ink)', sub: '#8a9a78' },
      failed:  { dot: 'var(--accent)', ring: 'transparent', ic: '#fff', label: 'var(--accent)', sub: 'var(--accent)' },
      skipped: { dot: '#e4ddcd', ring: 'transparent', ic: '#b0a48f', label: '#b0a48f', sub: '#c0b39c' },
    };
    return m[status] || m.idle;
  };
  const iconC = (stg, i) => stg.status === 'done' ? '✓' : stg.status === 'failed' ? '!' : stg.status === 'skipped' ? '–' : String(i + 1);
  return html`
    <div style="display:flex;flex-direction:column">
      ${STAGES.map((d, i) => {
        const stg = sts.find(s => s.name === d.key) || { status: 'idle', message: '' };
        const p = pal(stg.status);
        const sub = stg.message || d.blurb;
        const last = i === STAGES.length - 1;
        return html`
          <div style="display:flex;align-items:stretch;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center">
              <div style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:${p.dot};box-shadow:0 0 0 4px ${p.ring};display:flex;align-items:center;justify-content:center;transition:background .2s;animation:${stg.status === 'active' ? 'bbpulse 1.3s ease-in-out infinite' : 'none'}">
                ${stg.status === 'active'
                  ? html`<div style="width:11px;height:11px;border:2px solid rgba(255,255,255,0.45);border-top-color:#fff;border-radius:50%;animation:bbspin .7s linear infinite"></div>`
                  : html`<span style="font-family:var(--mono);font-size:12px;font-weight:600;color:${p.ic}">${iconC(stg, i)}</span>`}
              </div>
              ${!last ? html`<div style="width:2px;flex:1;min-height:12px;background:#e5dcca;margin:3px 0"></div>` : ''}
            </div>
            <div style="min-width:0;padding-bottom:${last ? '0' : '11px'};padding-top:2px">
              <div style="font-size:12.5px;font-weight:600;color:${p.label};line-height:1.2">${d.label}</div>
              <div style="font-size:11px;color:${p.sub};line-height:1.4;margin-top:1px">${sub}</div>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}
