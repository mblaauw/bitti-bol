import { html } from '../htm.js';
import { showLexicon, userLexiconSig } from '../state.js';
import LEXICON from '../lexicon.js';
export function LexiconModal() {
  if (!showLexicon.value) return null;
  const entries = [
    ...LEXICON.map(e => ({ pahari: e.pahari, gloss: e.gloss_en, avoid: (e.avoid || []).join(', '), isUser: false })),
    ...userLexiconSig.value.map((e, i) => ({ pahari: e.pahari, gloss: e.gloss_en, avoid: (e.avoid || []).join(', '), isUser: true, onDelete: () => { userLexiconSig.value = userLexiconSig.value.filter((_, j) => j !== i); } })),
  ];
  return html`
    <div class="modal" onClick=${e => { if (e.target === e.currentTarget) showLexicon.value = false; }} style="position:fixed;inset:0;background:rgba(38,33,26,0.42);backdrop-filter:blur(2px);display:flex;align-items:flex-start;justify-content:center;padding:52px 20px;z-index:100;overflow-y:auto">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;width:100%;max-width:680px;box-shadow:0 24px 60px rgba(38,33,26,0.22)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--border-light)">
          <div>
            <h2 style="font-size:16px;font-weight:700;color:#26211a">Lexicon</h2>
            <p style="font-size:11px;color:var(--text-dim);margin-top:2px">Vocabulary fed to the composer & the contamination scan</p>
          </div>
          <div style="display:flex;gap:8px">
            <button onClick=${() => {
              const pahari = prompt('Pahari word:'); if (!pahari) return;
              const gloss = prompt('English meaning:'); if (!gloss) return;
              const avoid = prompt('Words to avoid (comma-separated):') || '';
              userLexiconSig.value = [...userLexiconSig.value, { pahari, gloss_en: gloss, avoid: avoid ? avoid.split(',').map(x => x.trim()).filter(Boolean) : [] }];
            }} style="border:1px solid #d3c6a8;background:#fff;color:var(--warn-fg);border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer">+ Add word</button>
            <button onClick=${() => showLexicon.value = false} style="width:30px;height:30px;border:1px solid var(--border-input);background:#fff;border-radius:7px;cursor:pointer;color:#6b6152;font-size:14px">\u2715</button>
          </div>
        </div>
        <div style="padding:8px 22px 22px;max-height:60vh;overflow-y:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr>
                <th style="text-align:left;padding:9px 8px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);border-bottom:1px solid var(--border)">Pahari</th>
                <th style="text-align:left;padding:9px 8px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);border-bottom:1px solid var(--border)">Meaning</th>
                <th style="text-align:left;padding:9px 8px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);border-bottom:1px solid var(--border)">Avoid</th>
                <th style="width:40px;border-bottom:1px solid var(--border)"></th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(e => html`
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #f0e9db;vertical-align:top"><span style="font-family:var(--mono);font-weight:600;color:#26211a">${e.pahari}</span>${e.isUser ? html`<span style="margin-left:6px;font-size:9px;background:#f6e3db;color:var(--accent);padding:1px 5px;border-radius:4px;font-weight:600">user</span>` : ''}</td>
                  <td style="padding:8px;border-bottom:1px solid #f0e9db;vertical-align:top;color:#5e5344">${e.gloss}</td>
                  <td style="padding:8px;border-bottom:1px solid #f0e9db;vertical-align:top;color:var(--text-dim);font-family:var(--mono);font-size:11.5px">${e.avoid}</td>
                  <td style="padding:8px;border-bottom:1px solid #f0e9db;vertical-align:top;text-align:right">${e.isUser ? html`<button onClick=${e.onDelete} style="border:none;background:none;color:#c7bca6;cursor:pointer;font-size:13px">\u2715</button>` : ''}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
