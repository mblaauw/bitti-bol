import { html } from '../htm.js';
import { pipelineError, audioGen, showSettings } from '../state.js';
export function ErrorBanner() {
  const err = pipelineError.value;
  const audioErr = audioGen.value.status === 'error' ? audioGen.value.error : null;
  const activeErr = err || audioErr;
  if (!activeErr) return null;
  return html`
    <div class="callout-error">
      <strong>${activeErr.errorKind}</strong>
      <div>${activeErr.message}</div>
      ${(activeErr.errorKind === 'auth' || activeErr.errorKind === 'cors_or_network' || activeErr.errorKind === 'quota') && !err ? html`<button onClick=${() => showSettings.value = true} style="margin-top:8px;background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;padding:0">Open Settings \u2192</button>` : ''}
    </div>
  `;
}
