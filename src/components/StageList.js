import { html } from '../htm.js';
import { pipelineSteps, layoutMode, STAGES } from '../state.js';
export function StageList() {
  const sts = pipelineSteps.value;
  const ed = layoutMode.value === 'editorial';
  const pal = (status) => {
    const m = { idle: { dot: '#ece4d3', ic: '#b0a48f', label: '#a89a84' }, active: { dot: '#c0472a', ic: '#fff', label: '#26211a' }, done: { dot: '#4f7a3f', ic: '#fff', label: '#26211a' }, failed: { dot: '#c0472a', ic: '#fff', label: '#c0472a' }, skipped: { dot: '#e4ddcd', ic: '#b0a48f', label: '#b0a48f' } };
    return m[status] || m.idle;
  };
  const iconC = (stg, i) => stg.status === 'done' ? '✓' : stg.status === 'failed' ? '!' : stg.status === 'skipped' ? '–' : stg.status === 'active' ? '' : String(i + 1);
  const allDone = sts.some(s => s.status !== 'idle');
  return html`
    <div style="display:${ed ? 'flex' : 'flex'};flex-direction:${ed ? 'row' : 'column'};flex-wrap:${ed ? 'wrap' : 'nowrap'};gap:2px;align-items:${ed ? 'stretch' : 'stretch'}">
      ${STAGES.map((d, i) => {
        const stg = sts.find(s => s.name === d.key) || { status: 'idle', message: '' };
        const p = pal(stg.status);
        const sub = stg.message || d.blurb;
        return html`
          <div style="display:flex;align-items:${ed ? 'stretch' : 'flex-start'};flex-direction:${ed ? 'row' : 'column'}">
            ${i > 0 ? html`<div style="${ed ? 'width:16px;height:2px;background:#e2d9c7;align-self:center;margin:0 2px;flex-shrink:0' : 'width:2px;height:14px;background:#e2d9c7;margin-left:15px'}"></div>` : ''}
            <div style="display:flex;align-items:center;gap:${ed ? '9px' : '10px'};padding:${ed ? '6px 8px' : '5px 6px'}">
              <div style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:${p.dot};display:flex;align-items:center;justify-content:center;animation:${stg.status === 'active' ? 'bbpulse 1.3s ease-in-out infinite' : 'none'}">
                ${stg.status === 'active' ? html`<div style="display:block;width:11px;height:11px;border:2px solid rgba(255,255,255,0.45);border-top-color:#fff;border-radius:50%;animation:bbspin .7s linear infinite"></div>` : html`<span style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:${p.ic}">${iconC(stg, i)}</span>`}
              </div>
              <div style="min-width:0">
                <div style="font-size:12.5px;font-weight:600;color:${p.label};line-height:1.2">${d.label}</div>
                <div style="font-size:10.5px;color:#b0a48f;line-height:1.35">${sub}</div>
              </div>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}
