import { html } from '../htm.js';
import { pipelineError, showSettings } from '../state.js';
export function ErrorBanner() {
  const err = pipelineError.value;
  if (!err) return null;
  return html`
    <div class="callout-error">
      <strong>${err.errorKind}</strong>
      <div>${err.message}</div>
      ${err.errorKind === 'auth' || err.errorKind === 'cors_or_network' ? html`<button onClick=${() => showSettings.value = true} style="margin-top:8px;background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;padding:0">Open Settings \u2192</button>` : ''}
    </div>
  `;
}
