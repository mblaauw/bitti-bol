import { html } from '../htm.js';
import { showSettings, settings } from '../state.js';
import { DEFAULT_SETTINGS } from '../storage.js';

export function SettingsModal() {
  if (!showSettings.value) return null;
  const s = settings.value;
  const setNested = (path, value) => {
    const newS = JSON.parse(JSON.stringify(settings.value));
    let obj = newS; const keys = path.split('.');
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    settings.value = newS;
  };
  const field = (label, node) => html`<div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:5px">${label}</div>${node}</div>`;
  const slot = (name, label, sub) => html`
    <div class="card" style="padding:16px 17px;background:var(--bg-soft);box-shadow:none">
      <div style="margin-bottom:12px">
        <div style="font-size:12.5px;font-weight:700;color:var(--ink)">${label}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:1px">${sub}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:11px">
        ${field('Base URL', html`<input value=${s[name].baseUrl} onInput=${e => setNested(name + '.baseUrl', e.target.value)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}
        ${field('API key', html`<input type="password" value=${s[name].apiKey} onInput=${e => setNested(name + '.apiKey', e.target.value)} placeholder="sk-…" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}
        <div style="display:flex;gap:10px">
          <div style="flex:2">${field('Model', html`<input value=${s[name].model} onInput=${e => setNested(name + '.model', e.target.value)} placeholder="deepseek-v4-flash" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}</div>
          <div style="flex:1">${field('Temp', html`<input type="number" step="0.05" min="0" max="2" value=${s[name].temperature} onInput=${e => setNested(name + '.temperature', parseFloat(e.target.value) || 0.85)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}</div>
          <div style="flex:1">${field('Max tok', html`<input type="number" step="100" min="100" max="65536" value=${s[name].maxTokens} onInput=${e => setNested(name + '.maxTokens', parseInt(e.target.value) || 16384)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}</div>
        </div>
      </div>
    </div>
  `;
  return html`
    <div class="modal" onClick=${e => { if (e.target === e.currentTarget) showSettings.value = false; }}>
      <div class="modal-box" style="max-width:540px">
        <div class="modal-head">
          <div>
            <h2 style="font-size:16px;font-weight:700;color:var(--ink)">Settings</h2>
            <p style="font-size:11px;color:var(--text-dim);margin-top:2px">LLM endpoints for composer and critic</p>
          </div>
          <button class="icon-btn" style="width:30px;height:30px" onClick=${() => showSettings.value = false}>✕</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:16px">
          <div style="background:var(--accent-tint);border:1px solid #eec6ba;border-radius:var(--radius);padding:10px 13px;font-size:11.5px;color:#8a5648;line-height:1.5">API keys are stored in this browser's localStorage in plaintext. Don't use a shared device.</div>
          <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:#3a3128;cursor:pointer">
            <input type="checkbox" checked=${s.criticEnabled} onChange=${e => setNested('criticEnabled', e.target.checked)} style="width:16px;height:16px;accent-color:var(--accent)"/>
            Run the LLM critic pass after generation
          </label>
          <div style="border:1px solid var(--border-light);border-radius:var(--radius);padding:13px 15px;background:var(--bg-soft)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
              <div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft)">CORS Proxy</div>
              <span style="font-size:10px;color:var(--text-muted)">optional</span>
            </div>
            <input value=${s.corsProxy} onInput=${e => setNested('corsProxy', e.target.value)} placeholder="https://your-proxy.com/?" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>
            <p style="font-size:10.5px;color:var(--text-dim);margin-top:6px;line-height:1.45">Needed from <code style="background:#efebde;padding:1px 4px;border-radius:4px;font-size:10px">file://</code> where CORS blocks fetch. ⚠ Only use a proxy you control — it sees your API key.</p>
          </div>
          ${slot('composer', 'Composer Slot', 'Writes the song')}
          ${slot('critic', 'Critic Slot', 'Verifies dialect')}
          ${slot('generation', 'Generation Slot', 'Suno API audio generation')}
          <div class="card" style="padding:16px 17px;background:var(--bg-soft);box-shadow:none;margin-top:-12px">
            ${field('Callback URL', html`<input value=${s.generation.callBackUrl} onInput=${e => setNested('generation.callBackUrl', e.target.value)} placeholder="https://example.com/suno-callback" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius-sm);padding:8px 11px;font-size:12.5px;font-family:var(--mono);outline:none"/>`)}
          </div>
          <div style="display:flex;gap:10px;padding-top:2px">
            <button class="btn btn-primary" style="flex:1;padding:11px" onClick=${() => showSettings.value = false}>Done</button>
            <button class="btn btn-secondary" style="padding:11px 18px" onClick=${() => { if (confirm('Reset settings to defaults?')) settings.value = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); }}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
