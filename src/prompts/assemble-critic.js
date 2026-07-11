import LEXICON from '../lexicon.js';

export function assembleCriticPrompt(fragments, lyrics, title, style) {
  const kulluiLexicon = LEXICON.filter(e => (e.tags || []).includes('Kullui') || (e.tags || []).includes('Seraji') || (e.tags || []).includes('Pahari-General'));
  const lexBlock = kulluiLexicon.map(e => e.pahari + ' = ' + e.gloss_en).join('\n');
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
