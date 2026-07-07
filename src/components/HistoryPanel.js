import { html } from '../htm.js';
import { history, settings, userLexiconSig, songTitle, songLyrics, songStyle, songReport, scanHits, editMode, audioGen, selectedHistoryId } from '../state.js';
import { runContaminationScan } from '../core/index.js';
import { saveStorage, DEFAULT_SETTINGS } from '../storage.js';

function normalizeHistoryItem(record) {
  const report = record.report || {};
  if (report.iterations !== undefined) {
    return { ...record, wasRepaired: report.iterations > 0, iterationCount: report.iterations };
  }
  if (report.repair) {
    return { ...record, wasRepaired: report.repair.applied || false, iterationCount: report.repair.beforeHigh || 1 };
  }
  return { ...record, wasRepaired: false, iterationCount: 0 };
}

export function HistoryPanel() {
  const items = history.value.map(normalizeHistoryItem);
  const header = (count) => html`
    <div class="card-header" style="margin-bottom:${count ? '12px' : '10px'}">
      <div style="display:flex;align-items:baseline;gap:8px">
        <h2 class="panel-title">History</h2>
        ${count ? html`<span style="font-family:var(--mono);font-size:11px;color:var(--text-muted)">${count}</span>` : ''}
      </div>
      ${count ? html`
      <div style="display:flex;gap:5px">
        <button class="icon-btn" style="width:28px;height:28px" title="Export songbook" onClick=${() => {
          const blob = new Blob([JSON.stringify({ schemaVersion: 2, settings: settings.value, history: history.value, userLexicon: userLexiconSig.value }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bitti-bol-songbook.json'; a.click();
        }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M5 21h14"/></svg></button>
        <button class="icon-btn" style="width:28px;height:28px" title="Import songbook" onClick=${() => {
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
        }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M5 21h14"/></svg></button>
      </div>` : ''}
    </div>
  `;
  if (!items.length) return html`
    <section class="card">
      ${header(0)}
      <p style="font-size:12px;color:#b0a48f;line-height:1.55">No songs yet. Your generated songs collect here — a growing shelf of Pahari verse.</p>
    </section>
  `;
  return html`
    <section class="card">
      ${header(items.length)}
      <div style="display:flex;flex-direction:column;gap:7px;max-height:360px;overflow-y:auto">
        ${items.map(s => {
          const highH = (s.report && s.report.scan || []).filter(h => h.severity === 'high').length;
          const critc = s.report && s.report.critic;
          const authentic = critc ? critc.is_authentic : (highH === 0);
          let dateStr = '';
          try { dateStr = new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch {}
          return html`
            <div class="hist-row" onClick=${() => {
              const prevId = selectedHistoryId.value;
              if (prevId && prevId !== s.id) {
                const prevIdx = history.value.findIndex(r => r.id === prevId);
                if (prevIdx !== -1) {
                  const copy = [...history.value];
                  copy[prevIdx] = { ...copy[prevIdx], title: songTitle.value, lyrics: songLyrics.value, style: songStyle.value, updatedAt: new Date().toISOString() };
                  history.value = copy;
                }
              }
              songTitle.value = s.title; songLyrics.value = s.lyrics; songStyle.value = s.style;
              songReport.value = s.report || null;
              scanHits.value = runContaminationScan(s.lyrics);
              editMode.value = false;
              selectedHistoryId.value = s.id;
              const gens = s.audio;
              if (gens && Array.isArray(gens) && gens.length) {
                const last = gens.length - 1;
                audioGen.value = { status: 'done', taskId: gens[last].taskId || null, tracks: gens[last].tracks, error: null, generations: gens, activeGen: last };
              } else if (gens && gens.tracks && gens.tracks.length) {
                const legacy = [gens];
                audioGen.value = { status: 'done', taskId: gens.taskId || null, tracks: gens.tracks, error: null, generations: legacy, activeGen: 0 };
              } else {
                audioGen.value = { status: 'idle', taskId: null, tracks: [], error: null, generations: [], activeGen: -1 };
              }
            }}>
              <div style="display:flex;align-items:center;gap:10px;min-width:0">
                <span style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${authentic ? 'var(--success)' : 'var(--accent)'}" title="${authentic ? 'passed dialect checks' : 'had high-severity hits'}"></span>
                  <div style="min-width:0;flex:1;display:flex;align-items:center;gap:6px">
                  <div style="font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.title}</div>
                  ${(Array.isArray(s.audio) ? s.audio.length : s.audio?.tracks?.length) ? html`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` : ''}
                  ${s.wasRepaired ? html`<span style="flex-shrink:0;font-size:9px;color:#c7bca6;background:#f5f0e6;padding:0 5px;border-radius:3px;line-height:16px" title="Revised after critic feedback">R</span>` : ''}
                  <div style="font-family:var(--mono);font-size:10px;color:#b0a48f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.topic || '').slice(0, 28)} · ${dateStr}</div>
                </div>
                <button onClick=${e => { e.stopPropagation(); history.value = history.value.filter(h => h.id !== s.id); }} style="flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:none;background:none;color:#c7bca6;cursor:pointer;border-radius:5px;font-size:14px">✕</button>
              </div>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
