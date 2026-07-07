import { html } from '../htm.js';
import { pipelineSteps, pipelineError } from '../state.js';
import { StageList } from './StageList.js';
import { ErrorBanner } from './ErrorBanner.js';

export function PipelineCard() {
  const sts = pipelineSteps.value;
  const anyDone = sts.some(s => s.status !== 'idle');
  const anyActive = sts.some(s => s.status === 'active');
  let label = 'Idle', bg = '#ece5d6', fg = '#a89a84';
  if (pipelineError.value) { label = 'Failed'; bg = 'var(--accent-soft)'; fg = 'var(--accent)'; }
  else if (anyActive) { label = 'Running'; bg = 'var(--accent-soft)'; fg = 'var(--accent)'; }
  else if (anyDone) { label = 'Complete'; bg = 'var(--success-soft)'; fg = 'var(--success)'; }
  return html`
    <section class="card">
      <div class="card-header" style="margin-bottom:4px">
        <h2 class="panel-title">Pipeline</h2>
        <span class="badge" style="background:${bg};color:${fg}">${label}</span>
      </div>
      <p style="font-size:11px;color:var(--text-dim);line-height:1.45;margin-bottom:12px">Five stages run in sequence — each reports its own result.</p>
      <${StageList} />
      <${ErrorBanner} />
    </section>
  `;
}
