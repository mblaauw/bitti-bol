import { html } from '../htm.js';
import { signal } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import { showLexicon, userLexiconSig } from '../state.js';
import LEXICON from '../lexicon.js';

const lexSearch = signal('');

export function LexiconModal() {
  if (!showLexicon.value) return null;
  const q = lexSearch.value.trim().toLowerCase();
  const all = [
    ...LEXICON.map(e => ({ pahari: e.pahari, gloss: e.gloss_en, avoid: (e.avoid || []).join(', '), isUser: false })),
    ...userLexiconSig.value.map((e, i) => ({ pahari: e.pahari, gloss: e.gloss_en, avoid: (e.avoid || []).join(', '), isUser: true, onDelete: () => { userLexiconSig.value = userLexiconSig.value.filter((_, j) => j !== i); } })),
  ];
  const entries = q ? all.filter(e => (e.pahari + ' ' + e.gloss + ' ' + e.avoid).toLowerCase().includes(q)) : all;
  const th = (label, extra = '') => html`<th style="text-align:left;padding:9px 8px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-soft);border-bottom:1px solid var(--border);${extra}">${label}</th>`;
  return html`
    <div class="modal" onClick=${e => { if (e.target === e.currentTarget) showLexicon.value = false; }}>
      <div class="modal-box" style="max-width:680px">
        <div class="modal-head">
          <div>
            <h2 style="font-size:16px;font-weight:700;color:var(--ink)">Lexicon</h2>
            <p style="font-size:11px;color:var(--text-dim);margin-top:2px">Vocabulary fed to the composer & the contamination scan</p>
          </div>
          <div style="display:flex;gap:8px">
            <button onClick=${() => {
              const pahari = prompt('Pahari word:'); if (!pahari) return;
              const gloss = prompt('English meaning:'); if (!gloss) return;
              const avoid = prompt('Words to avoid (comma-separated):') || '';
              userLexiconSig.value = [...userLexiconSig.value, { pahari, gloss_en: gloss, avoid: avoid ? avoid.split(',').map(x => x.trim()).filter(Boolean) : [] }];
            }} style="border:1px solid #d3c6a8;background:#fff;color:var(--warn-fg);border-radius:var(--radius-sm);padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer">+ Add word</button>
            <button class="icon-btn" style="width:30px;height:30px" onClick=${() => showLexicon.value = false}>✕</button>
          </div>
        </div>
        <div style="padding:16px 24px 8px">
          <div style="position:relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:11px;top:50%;transform:translateY(-50%)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input value=${lexSearch.value} onInput=${e => lexSearch.value = e.target.value} placeholder="Search Pahari, meaning, or avoided words…" style="width:100%;background:#fff;border:1px solid var(--border-input);border-radius:var(--radius);padding:9px 12px 9px 34px;font-size:13px;outline:none"/>
          </div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--text-muted);margin-top:8px">${entries.length} of ${all.length} entries</div>
        </div>
        <div style="padding:0 22px 22px;max-height:56vh;overflow-y:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr>${th('Pahari')}${th('Meaning')}${th('Avoid')}${th('', 'width:40px')}</tr></thead>
            <tbody>
              ${entries.map(e => html`
                <tr>
                  <td style="padding:9px 8px;border-bottom:1px solid #f0e9db;vertical-align:top"><span style="font-family:var(--mono);font-weight:600;color:var(--ink)">${e.pahari}</span>${e.isUser ? html`<span style="margin-left:6px;font-size:9px;background:var(--accent-soft);color:var(--accent);padding:1px 5px;border-radius:4px;font-weight:600">user</span>` : ''}</td>
                  <td style="padding:9px 8px;border-bottom:1px solid #f0e9db;vertical-align:top;color:#5e5344">${e.gloss}</td>
                  <td style="padding:9px 8px;border-bottom:1px solid #f0e9db;vertical-align:top;color:var(--text-dim);font-family:var(--mono);font-size:11.5px">${e.avoid}</td>
                  <td style="padding:9px 8px;border-bottom:1px solid #f0e9db;vertical-align:top;text-align:right">${e.isUser ? html`<button onClick=${e.onDelete} style="border:none;background:none;color:#c7bca6;cursor:pointer;font-size:13px">✕</button>` : ''}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
