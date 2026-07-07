export function assembleComposerPrompt(fragments, formData, userLexicon = []) {
  const { topic, mood, occasion, instruments, notes } = formData;
  const moodMap = {
    'melancholic': 'A) SEPARATION AND LONGING',
    'joyful': 'B) CELEBRATION AND COMMUNITY',
    'peaceful': 'C) NATURE AND SPIRITUALITY',
    'bittersweet': 'D) RESILIENCE AND HARD LIFE',
    'romantic': 'A) SEPARATION AND LONGING (romantic emphasis)',
    'nostalgic': 'D) RESILIENCE AND HARD LIFE (memory emphasis)',
    'hopeful': 'C) NATURE AND SPIRITUALITY (renewal emphasis)',
  };
  const occasionMap = {
    'wedding': 'Wedding celebration — vibrant colors, dhol, community dancing',
    'mela': 'Village fair — festive energy, families gathering, naati dance',
    'harvest': 'Harvest season — gratitude, abundance, community labor',
    'winter': 'Winter stillness — cold, woodsmoke, indoor gatherings',
    'spring': 'Spring renewal — flowers blooming, new life, hope',
    'separation': 'Lovers separated — longing, memory, waiting on mountain paths',
    'daily_life': 'Daily mountain life — farming, shepherding, village routines',
    'festival': 'Festival celebration — music, dance, community tradition',
  };
  const userLines = [`${fragments.composerPersona}

${fragments.dialectRequirement}

USER REQUEST:
Topic: ${topic || 'mountain life'}
Mood: ${mood || 'traditional'} → ${moodMap[mood] || 'A) SEPARATION AND LONGING'}
Occasion: ${occasion || 'everyday life'} → ${occasionMap[occasion] || 'Daily life in the mountains'}
Instruments: ${instruments || 'Dhol, Nagara, Bansuri, Acoustic Guitar'}
Additional notes: ${notes || 'None provided'}

${fragments.songFormula}

${fragments.commonOpeners}

${fragments.emotionalVividness}

${fragments.culturalAuthenticity}

${fragments.chorusTechniques}

${fragments.narrativeThemes}

${fragments.dialectExamples}

${fragments.lyricsFormat}

${fragments.styleFormat}

${fragments.titleRule}

${fragments.outputContract}`];

  if (userLexicon && userLexicon.length) {
    userLines.push('\n\nUSER LEXICON (preferred terms):\n' + userLexicon.map(e => e.pahari + ' = ' + e.gloss_en).join('\n'));
  }

  return { system: 'You are a master Himachali Pahari folk songwriter.', user: userLines.join('\n') };
}
