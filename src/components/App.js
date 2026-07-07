import { html } from '../htm.js';
import { showSettings, showLexicon } from '../state.js';
import { InputForm } from './InputForm.js';
import { PipelineCard } from './PipelineCard.js';
import { SongCard } from './SongCard.js';
import { ContaminationPanel } from './ContaminationPanel.js';
import { HistoryPanel } from './HistoryPanel.js';
import { SettingsModal } from './SettingsModal.js';
import { LexiconModal } from './LexiconModal.js';

export function App() {
  return html`
    <div class="app-shell">
      <header class="app-header">
        <div style="display:flex;align-items:center;gap:16px;min-width:0">
          <div style="display:flex;align-items:center;gap:11px">
            <div style="width:34px;height:34px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(192,71,42,.28)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <div style="display:flex;flex-direction:column;line-height:1.1">
              <div style="display:flex;align-items:baseline;gap:2px">
                <span style="font-size:20px;font-weight:700;letter-spacing:-.02em;color:var(--accent)">Bitti</span>
                <span style="font-size:20px;font-weight:700;letter-spacing:-.02em;color:var(--ink)">Bol</span>
              </div>
              <span style="font-family:var(--mono);font-size:10px;letter-spacing:.04em;color:var(--text-dim);white-space:nowrap">Himachali Pahari Song Studio</span>
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <button class="icon-btn" onClick=${() => showLexicon.value = !showLexicon.value} title="Lexicon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/><path d="M18 7a3 3 0 0 1 3-3v16"/></svg>
          </button>
          <button class="icon-btn" onClick=${() => showSettings.value = true} title="Settings">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>
      <main class="app workspace">
        <div class="col-compose">
          <${InputForm} />
          <${PipelineCard} />
          <${HistoryPanel} />
        </div>
        <div class="col-stage">
          <${SongCard} />
        </div>
        <div class="col-scan">
          <${ContaminationPanel} />
        </div>
      </main>
    </div>
    ${showSettings.value ? html`<${SettingsModal} />` : ''}
    ${showLexicon.value ? html`<${LexiconModal} />` : ''}
  `;
}
