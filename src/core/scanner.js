import { CONTAMINATION_RULES } from '../constants.js';

export function runContaminationScan(lyrics) {
  const hits = []; const lines = (lyrics || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; const trimmed = line.trim();
    if (/^\[.*\]$/.test(trimmed)) continue;
    for (const rule of CONTAMINATION_RULES) {
      const re = new RegExp(rule.pattern, 'gi'); let m;
      while ((m = re.exec(line)) !== null) {
        if (rule.pattern === '\\bde\\b') {
          const after = line.slice(m.index + m[0].length);
          if (/^\s+naal\b/i.test(after)) { re.lastIndex = m.index + m[0].length; continue; }
          if (/^(\s+de\b)/i.test(after)) { re.lastIndex = m.index + m[0].length; continue; }
        }
        hits.push({ match: m[0], col: m.index, line: line.trim(), lineNo: i + 1, language: rule.language, severity: rule.severity, suggestion: rule.suggestion, explanation: rule.explanation, pattern: rule.pattern });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }
  hits.sort((a, b) => (a.lineNo - b.lineNo) || (a.col - b.col) || (b.match.length - a.match.length));
  const deduped = []; const seen = {};
  for (const h of hits) { const key = h.lineNo + ':' + h.col; if (seen[key]) continue; seen[key] = true; deduped.push(h); }
  return deduped;
}

export function applyReplacement(text, pattern, replacement, lineNo, col) {
  if (lineNo != null && col != null) {
    const lns = text.split('\n'); const idx = lineNo - 1;
    if (idx >= 0 && idx < lns.length) {
      const l = lns[idx]; const re = new RegExp(pattern, 'i'); const m = re.exec(l.slice(col));
      if (m) { const before = l.slice(0, col); const after = l.slice(col + m[0].length); lns[idx] = before + replacement + after; }
      return lns.join('\n');
    }
  }
  const re = new RegExp(pattern, 'gi'); return text.replace(re, replacement);
}

export function segmentLyrics(lyrics, hits) {
  const lines = (lyrics || '').split('\n'); const byLine = {};
  (hits || []).forEach((h, idx) => { (byLine[h.lineNo] = byLine[h.lineNo] || []).push({ ...h, idx }); });
  return lines.map((line, i) => {
    const lineNo = i + 1; const trimmed = line.trim();
    if (/^\[.*\]$/.test(trimmed)) return { type: 'tag', text: trimmed };
    if (trimmed === '') return { type: 'blank' };
    const lh = (byLine[lineNo] || []).slice().sort((a, b) => a.col - b.col);
    if (!lh.length) return { type: 'line', segments: [{ text: line, hit: false }] };
    const segs = []; let pos = 0;
    for (const h of lh) {
      if (h.col < pos) continue;
      if (h.col > pos) segs.push({ text: line.slice(pos, h.col), hit: false });
      segs.push({ text: line.slice(h.col, h.col + h.match.length), hit: true, idx: h.idx, severity: h.severity, language: h.language, suggestion: h.suggestion });
      pos = h.col + h.match.length;
    }
    if (pos < line.length) segs.push({ text: line.slice(pos), hit: false });
    return { type: 'line', segments: segs };
  });
}
