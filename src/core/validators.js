import { SUNO_RULES } from '../constants.js';

export function validateMechanical(lyrics, style) {
  const warnings = [];
  const lc = lyrics.length;
  const sc = style.length;
  if (lc > SUNO_RULES.limits.lyrics) warnings.push({ code: 'lyrics_overflow', severity: 'high', message: 'Lyrics exceed ' + SUNO_RULES.limits.lyrics + ' chars (' + lc + '). Suno may truncate.' });
  if (sc > SUNO_RULES.limits.style) warnings.push({ code: 'style_overflow', severity: 'high', message: 'Style exceeds ' + SUNO_RULES.limits.style + ' chars (' + sc + '). Suno may truncate.' });
  for (const tag of SUNO_RULES.requiredSections) {
    if (tag === '[Verse') { if (!lyrics.match(/\[Verse\s*\d+\]/i)) warnings.push({ code: 'missing_' + tag, severity: 'high', message: 'Missing required section: [Verse N]' }); }
    else { if (!lyrics.includes(tag)) warnings.push({ code: 'missing_' + tag, severity: 'high', message: 'Missing required section: ' + tag }); }
  }
  for (const tag of SUNO_RULES.recommendedSections) {
    if (!lyrics.includes(tag)) warnings.push({ code: 'missing_' + tag, severity: 'medium', message: 'Consider adding ' + tag + ' for better suno structure' });
  }
  const chorusSections = []; const cls = lyrics.split('\n'); let inChorus = false; let currentChorus = [];
  for (const line of cls) {
    if (/\[Chorus\]/i.test(line) || /\[Chorus\s*\d*\]/i.test(line)) { if (inChorus && currentChorus.length) chorusSections.push(currentChorus.join('\n').trim()); inChorus = true; currentChorus = []; continue; }
    if (inChorus) { if (/^\[/.test(line.trim())) { if (currentChorus.length) chorusSections.push(currentChorus.join('\n').trim()); inChorus = false; currentChorus = []; continue; } currentChorus.push(line); }
  }
  if (inChorus && currentChorus.length) chorusSections.push(currentChorus.join('\n').trim());
  if (chorusSections.length > 1) { const n = chorusSections.map(c => c.replace(/\s+/g, ' ').trim()); const f = n[0]; for (let i = 1; i < n.length; i++) { if (n[i] !== f) warnings.push({ code: 'chorus_mismatch', severity: 'medium', message: 'Chorus ' + (i + 1) + ' differs from first Chorus. Suno v5.5 works best with identical hooks.' }); } }
  const styleLower = style.toLowerCase();
  const firstSentence = style.split(/[,.]/)[0]?.trim().toLowerCase() || '';
  if (!firstSentence.includes('himachali') && !firstSentence.includes('pahari')) { warnings.push({ code: 'style_language_hint', severity: 'medium', message: 'Style block should open with a language hint (e.g. "sung in Himachali Pahari")' }); }
  for (const word of SUNO_RULES.styleRules.mustContain) { if (!styleLower.includes(word)) warnings.push({ code: 'style_missing_' + word, severity: 'medium', message: 'Style block should mention "' + word + '" for authentic Pahari sound' }); }
  const bpmMatch = style.match(/\b(\d{2,3})\s*bpm\b/i);
  if (bpmMatch) { const bpm = parseInt(bpmMatch[1]); if (bpm < SUNO_RULES.styleRules.bpm.min || bpm > SUNO_RULES.styleRules.bpm.max) { warnings.push({ code: 'style_bpm', severity: 'medium', message: 'BPM ' + bpm + ' outside recommended range (' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max + ') for naati rhythm' }); } }
  else { warnings.push({ code: 'style_bpm_missing', severity: 'medium', message: 'Style block should include a BPM range within ' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max }); }
  for (const phrase of SUNO_RULES.styleRules.forbidPhrases) { if (styleLower.includes(phrase.toLowerCase())) warnings.push({ code: 'style_backbeat', severity: 'medium', message: 'Avoid "' + phrase + '" (bhangra attractor). Use "dhol" and "nagara" phrasing instead.' }); }
  return { warnings, isValid: warnings.filter(w => w.severity === 'high').length === 0 };
}
