import { html } from '../htm.js';
import { songTitle, songLyrics, songStyle, songReport, scanHits, editMode, copyFeedback, scheduleScan } from '../state.js';
import { LyricsReadMode } from './LyricsReadMode.js';
import { ChecksGrid } from './ChecksGrid.js';
export function SongCard() {
  const hasSong = songTitle.value || songLyrics.value || songStyle.value;
  if (!hasSong) return html`
    <section style="grid-area:song;min-width:0">
      <div style="background:var(--bg-card);border:1px dashed #ddd3c0;border-radius:12px;padding:56px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:16px;min-height:360px">
        <svg width="72" height="46" viewBox="0 0 72 46" fill="none"><path d="M2 44 L24 12 L38 32 L50 6 L70 44 Z" fill="#efe7d7" stroke="#d8cebb" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="6" r="3" fill="#c0472a"/></svg>
        <div>
          <h3 style="font-size:19px;font-weight:600;color:#26211a;letter-spacing:-.01em">Compose a Pahari folk song</h3>
          <p style="font-size:13.5px;color:var(--text-dim);margin-top:6px;max-width:340px">Set a topic on the left and generate. Lyrics arrive in Mahasuvi Pahari, checked line-by-line for dialect drift.</p>
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
    <section style="grid-area:song;min-width:0;display:flex;flex-direction:column;gap:16px">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px 22px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
          <div style="min-width:0;flex:1">
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px">Title</div>
            <h1 style="font-size:29px;font-weight:700;letter-spacing:-.02em;color:#26211a;line-height:1.15;word-break:break-word">${songTitle.value}</h1>
          </div>
          <button onClick=${() => copy('title', songTitle.value)} style="flex-shrink:0;font-family:var(--mono);font-size:11px;padding:5px 10px;border:1px solid var(--border-input);background:#fff;border-radius:7px;cursor:pointer;color:#6b6152">${copyFeedback.value.title ? 'copied' : 'copy'}</button>
        </div>
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)">Style prompt</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="char-count ${scCls}">${styleLen} / 1000</span>
              <button onClick=${() => copy('style', songStyle.value)} style="flex-shrink:0;font-family:var(--mono);font-size:11px;padding:5px 10px;border:1px solid var(--border-input);background:#fff;border-radius:7px;cursor:pointer;color:#6b6152">${copyFeedback.value.style ? 'copied' : 'copy'}</button>
            </div>
          </div>
          <textarea value=${songStyle} onInput=${e => songStyle.value = e.target.value} style="width:100%;min-height:64px;resize:vertical;font-family:var(--mono);font-size:12.5px;line-height:1.6;background:var(--bg-soft);border:1px solid var(--border-light);border-radius:8px;padding:11px 13px;outline:none;color:#3a3128"></textarea>
        </div>
      </div>

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 20px;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)">Lyrics</div>
            <span class="char-count ${lcCls}">${lyricsLen} / 5000</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="display:flex;background:#efe9dc;border:1px solid var(--border-input);border-radius:7px;padding:2px">
              <button onClick=${() => editMode.value = false} style="padding:5px 12px;border:none;border-radius:6px;background:${!editMode.value ? '#fff' : 'transparent'};color:${!editMode.value ? '#26211a' : '#8a7d68'};font-size:12px;font-weight:${!editMode.value ? '600' : '500'};cursor:pointer;box-shadow:${!editMode.value ? '0 1px 2px rgba(38,33,26,0.08)' : 'none'}">Read</button>
              <button onClick=${() => editMode.value = true} style="padding:5px 12px;border:none;border-radius:6px;background:${editMode.value ? '#fff' : 'transparent'};color:${editMode.value ? '#26211a' : '#8a7d68'};font-size:12px;font-weight:${editMode.value ? '600' : '500'};cursor:pointer;box-shadow:${editMode.value ? '0 1px 2px rgba(38,33,26,0.08)' : 'none'}">Edit</button>
            </div>
            <button onClick=${() => copy('lyrics', songLyrics.value)} style="font-family:var(--mono);font-size:11px;padding:5px 10px;border:1px solid var(--border-input);background:#fff;border-radius:7px;cursor:pointer;color:#6b6152">${copyFeedback.value.lyrics ? 'copied' : 'copy'}</button>
          </div>
        </div>
        ${editMode.value ? html`
          <textarea value=${songLyrics} onInput=${e => { songLyrics.value = e.target.value; scheduleScan(e.target.value); }} spellcheck="false" style="width:100%;min-height:420px;resize:vertical;border:none;outline:none;background:var(--bg-soft);font-family:var(--mono);font-size:13px;line-height:1.85;padding:20px 24px;color:#3a3128"></textarea>
        ` : html`<${LyricsReadMode} />`}
      </div>

      <${ChecksGrid} />
    </section>
  `;
}
