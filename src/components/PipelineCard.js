import { html } from '../htm.js';
import { pipelineSteps, pipelineError } from '../state.js';
import { StageList } from './StageList.js';
import { ErrorBanner } from './ErrorBanner.js';
export function PipelineCard() {
  const sts = pipelineSteps.value;
  const anyDone = sts.some(s => s.status !== 'idle');
  const anyActive = sts.some(s => s.status === 'active');
  let label = 'Idle', bg = '#efe9dc', fg = '#a89a84';
  if (pipelineError.value) { label = 'Failed'; bg = '#f6e0d9'; fg = '#c0472a'; }
  else if (anyActive) { label = 'Running'; bg = '#f6e3db'; fg = '#c0472a'; }
  else if (anyDone) { label = 'Complete'; bg = '#e6efdd'; fg = '#4f7a3f'; }
  return html`
    <section style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px;min-width:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <h2 style="font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#26211a">Generation pipeline</h2>
        <span style="font-family:var(--mono);font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:600;padding:3px 9px;border-radius:20px;background:${bg};color:${fg}">${label}</span>
      </div>
      ${!anyDone && !anyActive && !pipelineError.value ? html`<p style="font-size:11.5px;color:#b0a48f;line-height:1.5">Five stages run in sequence. Each reports its own result \u2014 nothing hides behind a spinner.</p>` : html`<${StageList} />`}
      <${ErrorBanner} />
    </section>
  `;
}
