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
    <div style="min-height:100vh;display:flex;flex-direction:column">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 28px;border-bottom:1px solid var(--border);background:#faf7f0;position:sticky;top:0;z-index:20">
        <div style="display:flex;align-items:baseline;gap:14px;min-width:0">
          <div style="display:flex;align-items:baseline;gap:2px">
            <span style="font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--accent)">Bitti</span>
            <span style="font-size:22px;font-weight:700;letter-spacing:-.02em;color:#26211a"> Bol</span>
          </div>
          <span style="font-family:var(--mono);font-size:11px;letter-spacing:.02em;color:var(--text-dim);white-space:nowrap">Himachali Pahari Song Studio</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <button onClick=${() => showLexicon.value = !showLexicon.value} title="Lexicon" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-input);background:#fbf9f4;border-radius:8px;cursor:pointer;color:#6b6152">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/><path d="M18 7a3 3 0 0 1 3-3v16"/></svg>
          </button>
          <button onClick=${() => showSettings.value = true} title="Settings" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-input);background:#fbf9f4;border-radius:8px;cursor:pointer;color:#6b6152">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>
      <main class="app grid-layout">
        <${InputForm} />
        <${PipelineCard} />
        <${SongCard} />
        <${ContaminationPanel} />
        <${HistoryPanel} />
      </main>
    </div>
    ${showSettings.value ? html`<${SettingsModal} />` : ''}
    ${showLexicon.value ? html`<${LexiconModal} />` : ''}
  `;
}
