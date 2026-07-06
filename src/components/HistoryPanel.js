import { html } from '../htm.js';
import { history, settings, userLexiconSig, songTitle, songLyrics, songStyle, songReport, scanHits, editMode } from '../state.js';
import { runContaminationScan } from '../core/index.js';
import { saveStorage, DEFAULT_SETTINGS } from '../storage.js';
export function HistoryPanel() {
  const items = history.value;
  if (!items.length) return html`
    <section style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px;min-width:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:baseline;gap:8px">
          <h2 style="font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#26211a">History</h2>
        </div>
      </div>
      <p style="font-size:12px;color:#b0a48f;line-height:1.5">No songs yet. Your generated songs collect here \u2014 a growing shelf of Pahari verse.</p>
    </section>
  `;
  return html`
    <section style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px;min-width:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:baseline;gap:8px">
          <h2 style="font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#26211a">History</h2>
          <span style="font-family:var(--mono);font-size:11px;color:var(--text-muted)">${items.length}</span>
        </div>
        <div style="display:flex;gap:4px">
          <button onClick=${() => {
            const blob = new Blob([JSON.stringify({ schemaVersion: 2, settings: settings.value, history: history.value, userLexicon: userLexiconSig.value }, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bitti-bol-songbook.json'; a.click();
          }} title="Export songbook" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-input);background:#fff;border-radius:6px;cursor:pointer;color:var(--text-soft)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M5 21h14"/></svg></button>
          <button onClick=${() => {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
            input.onchange = async () => {
              try {
                const text = await input.files[0].text();
                const data = JSON.parse(text);
                if (data.schemaVersion !== 2) { alert('Invalid schema version'); return; }
                if (data.history) {
                  const byId = {};
                  history.value.forEach(h => byId[h.id] = h);
                  for (const h of data.history) byId[h.id || crypto.randomUUID()] = h;
                  history.value = Object.values(byId).slice(0, 50);
                }
                if (data.settings) {
                  settings.value = {
                    ...settings.value, ...data.settings,
                    composer: { ...(settings.value.composer || {}), ...(data.settings.composer || {}) },
                    critic: { ...(settings.value.critic || {}), ...(data.settings.critic || {}) },
                  };
                }
                if (data.userLexicon) {
                  const byWord = {};
                  userLexiconSig.value.forEach(e => byWord[e.pahari] = e);
                  for (const e of data.userLexicon) byWord[e.pahari] = e;
                  userLexiconSig.value = Object.values(byWord);
                }
                saveStorage();
              } catch (e) { alert('Import failed: ' + e.message); }
            };
            input.click();
          }} title="Import songbook" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-input);background:#fff;border-radius:6px;cursor:pointer;color:var(--text-soft)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M5 21h14"/></svg></button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:7px;max-height:400px;overflow-y:auto">
        ${items.map(s => {
          const highH = (s.report && s.report.scan || []).filter(h => h.severity === 'high').length;
          const critc = s.report && s.report.critic;
          // Precedence: critic verdict > high-hit count > defaults to true
          const authentic = critc ? critc.is_authentic : (highH === 0);
          let dateStr = '';
          try { dateStr = new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch {}
          return html`
            <div onClick=${() => {
              songTitle.value = s.title; songLyrics.value = s.lyrics; songStyle.value = s.style;
              songReport.value = s.report || null;
              scanHits.value = runContaminationScan(s.lyrics);
              editMode.value = false;
            }} style="padding:9px 11px;border:1px solid var(--border-light);border-radius:9px;background:var(--bg-soft);cursor:pointer;transition:border-color .12s,background .12s">
              <div style="display:flex;align-items:center;gap:9px;min-width:0">
                <span style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${authentic ? '#4f7a3f' : '#c0472a'}" title="${authentic ? 'passed dialect checks' : 'had high-severity hits'}"></span>
                <div style="min-width:0;flex:1">
                  <div style="font-size:13px;font-weight:600;color:#26211a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.title}</div>
                  <div style="font-family:var(--mono);font-size:10px;color:#b0a48f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.topic || '').slice(0, 28)} \u00b7 ${dateStr}</div>
                </div>
                <button onClick=${e => { e.stopPropagation(); history.value = history.value.filter(h => h.id !== s.id); }} style="flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:none;background:none;color:#c7bca6;cursor:pointer;border-radius:5px;font-size:14px">\u2715</button>
              </div>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
