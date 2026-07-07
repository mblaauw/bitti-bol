import { html } from '../htm.js';
import { songTitle, songLyrics, songStyle, songReport, scanHits, editMode, copyFeedback, scheduleScan } from '../state.js';
import { LyricsReadMode } from './LyricsReadMode.js';
import { ChecksGrid } from './ChecksGrid.js';

export function SongCard() {
  const hasSong = songTitle.value || songLyrics.value || songStyle.value;
  if (!hasSong) return html`
    <section style="min-width:0">
      <div style="background:var(--bg-card);border:1px dashed var(--border-strong);border-radius:var(--radius-xl);padding:72px 40px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:20px;min-height:440px;box-shadow:var(--shadow-card)">
        <div style="width:76px;height:76px;border-radius:50%;background:var(--accent-tint);display:flex;align-items:center;justify-content:center">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div>
          <h3 style="font-family:var(--serif);font-size:24px;font-weight:600;color:var(--ink);letter-spacing:-.01em">Compose a Pahari folk song</h3>
          <p style="font-size:14px;color:var(--text-dim);margin-top:8px;max-width:380px;line-height:1.55">Set a topic on the left and generate. Lyrics arrive in Mahasuvi Pahari, checked line-by-line for dialect drift.</p>
        </div>
      </div>
    </section>
  `;
  const copy = (field, val) => {
    try { navigator.clipboard.writeText(val || ''); copyFeedback.value = { ...copyFeedback.value, [field]: true }; setTimeout(() => copyFeedback.value = { ...copyFeedback.value, [field]: false }, 1400); } catch {}
  };
  const styleLen = (songStyle.value || '').length;
  const lyricsLen = (songLyrics.value || '').length;
  const scCls = styleLen > 1000 ? 'over' : styleLen > 900 ? 'warn' : 'ok';
  const lcCls = lyricsLen > 5000 ? 'over' : lyricsLen > 4500 ? 'warn' : 'ok';
  return html`
    <section class="bb-fade" style="min-width:0;display:flex;flex-direction:column;gap:18px">
      <div class="card" style="padding:24px 26px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
          <div style="min-width:0;flex:1">
            <div class="eyebrow" style="margin-bottom:8px">Title</div>
            <h1 style="font-family:var(--serif);font-size:33px;font-weight:600;letter-spacing:-.015em;color:var(--ink);line-height:1.14;word-break:break-word">${songTitle.value}</h1>
          </div>
          <button class="chip-btn" onClick=${() => copy('title', songTitle.value)}>${copyFeedback.value.title ? 'copied' : 'copy'}</button>
        </div>
        <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div class="eyebrow">Style prompt</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="char-count ${scCls}">${styleLen} / 1000</span>
              <button class="chip-btn" onClick=${() => copy('style', songStyle.value)}>${copyFeedback.value.style ? 'copied' : 'copy'}</button>
            </div>
          </div>
          <textarea value=${songStyle.value} onInput=${e => songStyle.value = e.target.value} style="width:100%;min-height:66px;resize:vertical;font-family:var(--mono);font-size:12.5px;line-height:1.6;background:var(--bg-soft);border:1px solid var(--border-light);border-radius:var(--radius);padding:12px 14px;outline:none;color:#3a3128"></textarea>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 22px;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="eyebrow">Lyrics</div>
            <span class="char-count ${lcCls}">${lyricsLen} / 5000</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="seg">
              <button class=${!editMode.value ? 'on' : ''} onClick=${() => editMode.value = false}>Read</button>
              <button class=${editMode.value ? 'on' : ''} onClick=${() => editMode.value = true}>Edit</button>
            </div>
            <button class="chip-btn" onClick=${() => copy('lyrics', songLyrics.value)}>${copyFeedback.value.lyrics ? 'copied' : 'copy'}</button>
          </div>
        </div>
        ${editMode.value ? html`
          <textarea value=${songLyrics.value} onInput=${e => { songLyrics.value = e.target.value; scheduleScan(e.target.value); }} spellcheck="false" style="width:100%;min-height:440px;resize:vertical;border:none;outline:none;background:var(--bg-soft);font-family:var(--mono);font-size:13px;line-height:1.85;padding:22px 26px;color:#3a3128"></textarea>
        ` : html`<${LyricsReadMode} />`}
      </div>

      <${ChecksGrid} />
    </section>
  `;
}
