import { PROMPT_FRAGMENTS, PROMPT_VERSION } from '../constants.js';

export function assembleComposerPrompt(formData, userLexicon = []) {
  return PROMPT_FRAGMENTS.assembleComposerPrompt(formData, userLexicon);
}

export function assembleCriticPrompt(lyrics, title, style) {
  return PROMPT_FRAGMENTS.assembleCriticPrompt(lyrics, title, style);
}

export { PROMPT_VERSION };
