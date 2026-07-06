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
  const slot = (name, label) => html`
    <div class="card" style="border:1px solid var(--border-light);border-radius:10px;padding:15px 16px;background:var(--bg-soft)">
      <div style="font-size:12px;font-weight:700;color:#26211a;margin-bottom:11px">${label}</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:4px">Base URL</div><input value=${s[name].baseUrl} onInput=${e => setNested(name + '.baseUrl', e.target.value)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/></div>
        <div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:4px">API key</div><input type="password" value=${s[name].apiKey} onInput=${e => setNested(name + '.apiKey', e.target.value)} placeholder="sk-\u2026" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/></div>
        <div style="display:flex;gap:10px">
          <div style="flex:2"><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:4px">Model</div><input value=${s[name].model} onInput=${e => setNested(name + '.model', e.target.value)} placeholder="deepseek-v4-flash" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/></div>
          <div style="flex:1"><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:4px">Temp</div><input type="number" step="0.05" min="0" max="2" value=${s[name].temperature} onInput=${e => setNested(name + '.temperature', parseFloat(e.target.value) || 0.85)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/></div>
          <div style="flex:1"><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);margin-bottom:4px">Max tok</div><input type="number" step="100" min="100" max="16000" value=${s[name].maxTokens} onInput=${e => setNested(name + '.maxTokens', parseInt(e.target.value) || 4000)} style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/></div>
        </div>
      </div>
    </div>
  `;
  return html`
    <div onClick=${e => { if (e.target === e.currentTarget) showSettings.value = false; }} style="position:fixed;inset:0;background:rgba(38,33,26,0.42);backdrop-filter:blur(2px);display:flex;align-items:flex-start;justify-content:center;padding:52px 20px;z-index:100;overflow-y:auto">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;width:100%;max-width:540px;box-shadow:0 24px 60px rgba(38,33,26,0.22)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--border-light)">
          <div>
            <h2 style="font-size:16px;font-weight:700;color:#26211a">Settings</h2>
            <p style="font-size:11px;color:var(--text-dim);margin-top:2px">LLM endpoints for composer and critic</p>
          </div>
          <button onClick=${() => showSettings.value = false} style="width:30px;height:30px;border:1px solid var(--border-input);background:#fff;border-radius:7px;cursor:pointer;color:#6b6152;font-size:14px">\u2715</button>
        </div>
        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:16px">
          <div style="background:#f8e5df;border:1px solid #eec6ba;border-radius:8px;padding:10px 12px;font-size:11.5px;color:#8a5648;line-height:1.5">API keys are stored in this browser's localStorage in plaintext. Don't use a shared device.</div>
          <label style="display:flex;align-items:center;gap:9px;font-size:13px;color:#3a3128;cursor:pointer">
            <input type="checkbox" checked=${s.criticEnabled} onChange=${e => setNested('criticEnabled', e.target.checked)} style="width:16px;height:16px;accent-color:#c0472a"/>
            Run the LLM critic pass after generation
          </label>
          <div style="border:1px solid var(--border-light);border-radius:10px;padding:12px 14px;background:var(--bg-soft)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft)">CORS Proxy</div>
              <span style="font-size:10px;color:var(--text-muted)">optional</span>
            </div>
            <input value=${s.corsProxy} onInput=${e => setNested('corsProxy', e.target.value)} placeholder="https://your-proxy.com/?" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:7px;padding:7px 10px;font-size:12.5px;font-family:var(--mono);outline:none"/>
            <p style="font-size:10.5px;color:var(--text-dim);margin-top:5px;line-height:1.45">Needed from <code style="background:#efebde;padding:1px 4px;border-radius:4px;font-size:10px">file://</code> where CORS blocks fetch. ⚠ Only use a proxy you control — it sees your API key.</p>
          </div>
          ${slot('composer', 'Composer slot \u00b7 writes the song')}
          ${slot('critic', 'Critic slot \u00b7 verifies dialect')}
          <div style="display:flex;gap:10px;padding-top:2px">
            <button onClick=${() => showSettings.value = false} style="flex:1;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:600;cursor:pointer">Done</button>
            <button onClick=${() => { if (confirm('Reset settings to defaults?')) settings.value = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); }} style="background:#fff;color:#6b6152;border:1px solid var(--border-input);border-radius:8px;padding:10px 16px;font-size:13px;cursor:pointer">Reset</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
