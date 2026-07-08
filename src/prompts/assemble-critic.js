import LEXICON from '../lexicon.js';

export function assembleCriticPrompt(fragments, lyrics, title, style) {
  const lexBlock = LEXICON.map(e => e.pahari + ' = ' + e.gloss_en).join('\n');
  return {
    system: `${fragments.criticPersona}

${fragments.validationRules}

${fragments.criticRules}

Lexicon reference:
${lexBlock}

${fragments.criticOutput}`,
    user: `SONG TITLE: ${title}
STYLE: ${style}

LYRICS TO ANALYZE:
${lyrics.slice(0, 3000)}`,
  };
}
