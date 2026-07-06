import { CONTAMINATION_RULES, SUNO_RULES, SONG_PATTERNS, PROMPT_FRAGMENTS } from '../constants.js';
import LEXICON from '../lexicon.js';

export function assemblePrompt(prefs, userLexicon = [], includeLexicon = true) {
  const fullLex = [...LEXICON, ...(userLexicon || [])];
  const lexBlock = includeLexicon ? fullLex.map(e => e.pahari + ' = ' + e.gloss_en + (e.avoid?.length ? ' (avoid: ' + e.avoid.join(', ') + ')' : '')).join('\n') : '';
  const rulesBlock = 'Style rules:\n- First sentence: "sung in Himachali Pahari"\n- Must name genre as naati\n- Percussion: dhol and nagara (no backbeat phrasing)\n- BPM: ' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max + '\n- No bhangra references\n';
  const structureBlock = 'Structure: ' + SONG_PATTERNS.structure.join(' → ') + '\nForm: ' + SONG_PATTERNS.form + '\nTrope chains: ' + SONG_PATTERNS.tropeChains.join('; ') + '\nChorus rule: ' + SONG_PATTERNS.chorusRule + '\n';
  const userLines = ['Create a Himachali Pahari folk song about: ' + prefs.topic];
  if (prefs.mood) userLines.push('Mood: ' + prefs.mood);
  if (prefs.occasion) userLines.push('Occasion: ' + prefs.occasion);
  if (prefs.instruments) userLines.push('Incorporate these instruments: ' + prefs.instruments);
  if (prefs.notes) userLines.push('Additional guidance: ' + prefs.notes);
  userLines.push('\nRemember: Lyrics in authentic Mahasuvi/Sirmauri Pahari. Style in English. Output ONLY valid JSON.');
  return { system: PROMPT_FRAGMENTS.composerPersona + '\n\n' + PROMPT_FRAGMENTS.dialectRequirement + '\n\n## Pahari Lexicon (use these)\n' + lexBlock + '\n\n## ' + rulesBlock + '\n\n## ' + structureBlock + '\n\n## Output Format\n' + PROMPT_FRAGMENTS.titleRule + '\n' + PROMPT_FRAGMENTS.lyricsFormat + '\n' + PROMPT_FRAGMENTS.styleFormat + '\n' + PROMPT_FRAGMENTS.outputContract, user: userLines.join('\n') };
}

export function assembleCriticPrompt(lyrics) {
  const lexBlock = LEXICON.map(e => e.pahari + ' = ' + e.gloss_en).join('\n');
  const rulesBlock = CONTAMINATION_RULES.filter(r => r.severity === 'high').map(r => r.pattern + ' (' + r.language + ' ' + r.severity + ') → ' + r.suggestion).join('\n');
  return { system: PROMPT_FRAGMENTS.criticPersona + '\n\nLexicon:\n' + lexBlock + '\n\nKnown contamination patterns:\n' + rulesBlock + '\n\n' + PROMPT_FRAGMENTS.criticOutput, user: 'Validate these lyrics:\n\n' + lyrics.slice(0, 3000) };
}
