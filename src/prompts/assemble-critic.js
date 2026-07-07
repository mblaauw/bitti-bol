import LEXICON from '../lexicon.js';
import { CONTAMINATION_RULES } from '../constants.js';

export function assembleCriticPrompt(fragments, lyrics, title, style) {
  const lexBlock = LEXICON.map(e => e.pahari + ' = ' + e.gloss_en).join('\n');
  const highRules = CONTAMINATION_RULES.filter(r => r.severity === 'high')
    .map(r => `  ${r.pattern} → ${r.suggestion} (${r.language})`).join('\n');
  return {
    system: `${fragments.criticPersona}

${fragments.validationRules}

${fragments.criticRules}

Lexicon reference:
${lexBlock}

Known high-severity contamination patterns:
${highRules}

${fragments.criticOutput}`,
    user: `SONG TITLE: ${title}
STYLE: ${style}

LYRICS TO ANALYZE:
${lyrics.slice(0, 3000)}`,
  };
}
