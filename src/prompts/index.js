import { COMPOSER_PERSONA } from './composer-persona.js';
import { DIALECT_REQUIREMENT } from './dialect-requirement.js';
import { LYRICS_FORMAT } from './lyrics-format.js';
import { STYLE_FORMAT } from './style-format.js';
import { TITLE_RULE } from './title-rule.js';
import { OUTPUT_CONTRACT } from './output-contract.js';
import { CRITIC_PERSONA } from './critic-persona.js';
import { CRITIC_OUTPUT } from './critic-output.js';
import { SONG_FORMULA } from './song-formula.js';
import { COMMON_OPENERS } from './common-openers.js';
import { EMOTIONAL_VIVIDNESS } from './emotional-vividness.js';
import { CULTURAL_AUTHENTICITY } from './cultural-authenticity.js';
import { CHORUS_TECHNIQUES } from './chorus-techniques.js';
import { NARRATIVE_THEMES } from './narrative-themes.js';
import { DIALECT_EXAMPLES } from './dialect-examples.js';
import { ITERATIVE_IMPROVEMENT } from './iterative-improvement.js';
import { VALIDATION_RULES } from './validation-rules.js';
import { CRITIC_RULES } from './critic-rules.js';
import { assembleComposerPrompt } from './assemble-composer.js';
import { assembleCriticPrompt } from './assemble-critic.js';

export const PROMPT_VERSION = '3.0.0';

// Pass 1: fragments only (no assemblers) — avoids circular deps
const FRAGMENTS = {
  composerPersona: COMPOSER_PERSONA,
  dialectRequirement: DIALECT_REQUIREMENT,
  lyricsFormat: LYRICS_FORMAT,
  styleFormat: STYLE_FORMAT,
  titleRule: TITLE_RULE,
  outputContract: OUTPUT_CONTRACT,
  criticPersona: CRITIC_PERSONA,
  criticOutput: CRITIC_OUTPUT,
  songFormula: SONG_FORMULA,
  commonOpeners: COMMON_OPENERS,
  emotionalVividness: EMOTIONAL_VIVIDNESS,
  culturalAuthenticity: CULTURAL_AUTHENTICITY,
  chorusTechniques: CHORUS_TECHNIQUES,
  narrativeThemes: NARRATIVE_THEMES,
  dialectExamples: DIALECT_EXAMPLES,
  iterativeImprovement: ITERATIVE_IMPROVEMENT,
  validationRules: VALIDATION_RULES,
  criticRules: CRITIC_RULES,
};

// Pass 2: build full PROMPT_FRAGMENTS with assembler methods bound to FRAGMENTS
export const PROMPT_FRAGMENTS = {
  ...FRAGMENTS,
  assembleComposerPrompt: (formData, userLexicon) =>
    assembleComposerPrompt(FRAGMENTS, formData, userLexicon),
  assembleCriticPrompt: (lyrics, title, style) =>
    assembleCriticPrompt(FRAGMENTS, lyrics, title, style),
};
