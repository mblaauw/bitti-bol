import LEXICON from './lexicon.js';

export const CONTAMINATION_RULES = [
  { pattern: '\\bde naal\\b', language: 'punjabi', severity: 'high', suggestion: 'manjh', explanation: 'Punjabi "de naal" means "with"; use Pahari "manjh" or postpositional forms' },
  { pattern: '\\bjadon\\b', language: 'punjabi', severity: 'high', suggestion: 'jaalu', explanation: 'Punjabi "jadon" = when; Pahari uses "jaalu"' },
  { pattern: '\\bgallan\\b', language: 'punjabi', severity: 'high', suggestion: 'katha', explanation: 'Punjabi "gallan" = talk/stories; Pahari uses "katha"' },
  { pattern: '\\bdila ch\\b', language: 'punjabi', severity: 'high', suggestion: 'manjh', explanation: 'Punjabi "dila ch" = in the heart; use Pahari "manjh"' },
  { pattern: '\\bmainu\\b', language: 'punjabi', severity: 'high', suggestion: 'minjo', explanation: 'Punjabi "mainu" = to me; Pahari uses "minjo"' },
  { pattern: '\\btainu\\b', language: 'punjabi', severity: 'high', suggestion: 'tujo / tujhe', explanation: 'Punjabi "tainu" = to you; use Pahari forms' },
  { pattern: '\\bpind\\b', language: 'punjabi', severity: 'high', suggestion: 'graan', explanation: 'Punjabi "pind" = village; Pahari uses "graan"' },
  { pattern: '\\bvich\\b', language: 'punjabi', severity: 'high', suggestion: 'manjh', explanation: 'Punjabi "vich" = in; Pahari uses "manjh"' },
  { pattern: '\\bdi\\b', language: 'punjabi', severity: 'medium', suggestion: 'ri / ra / re', explanation: 'Punjabi genitive "di" should be Pahari "ri" (fem) / "ra" (masc) / "re" (obl)' },
  { pattern: '\\bda\\b', language: 'punjabi', severity: 'medium', suggestion: 'ra', explanation: 'Punjabi genitive "da" should be Pahari "ra"' },
  { pattern: '\\bde\\b', language: 'punjabi', severity: 'medium', suggestion: 're', explanation: 'Punjabi oblique genitive "de" should be Pahari "re"' },
  { pattern: '\\bmujhe\\b', language: 'hindi', severity: 'medium', suggestion: 'minjo', explanation: 'Hindi "mujhe" = to me; use Pahari "minjo"' },
  { pattern: '\\btumhara\\b', language: 'hindi', severity: 'medium', suggestion: 'tera / teri', explanation: 'Hindi "tumhara" = your; use Pahari "tera/teri"' },
  { pattern: '\\bkyunki\\b', language: 'hindi', severity: 'medium', suggestion: 'kathi / je', explanation: 'Hindi "kyunki" = because; use Pahari forms' },
  { pattern: '\\blekin\\b', language: 'hindi', severity: 'medium', suggestion: 'par / magar (acceptable)', explanation: 'Hindi "lekin" = but; "par" is borderline acceptable' },
  { pattern: '\\bdekhda\\b', language: 'hindi', severity: 'medium', suggestion: 'herda', explanation: 'Hindi "dekhda" = watching; use Pahari "herda"' },
  { pattern: '\\braat\\b', language: 'hindi', severity: 'medium', suggestion: 'rouni', explanation: '"rouni" preferred for night; "raat" acceptable in mixed register' },
  { pattern: '\\blarki\\b', language: 'hindi', severity: 'medium', suggestion: 'bitti', explanation: 'Hindi "larki" = girl; use Pahari "bitti"' },
];

// Derive medium rules from lexicon avoid terms
for (const entry of LEXICON) {
  if (!entry.avoid || !entry.avoid.length) continue;
  for (const word of entry.avoid) {
    if (word.includes('(acceptable)')) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = '\\b' + escaped + '\\b';
    if (!CONTAMINATION_RULES.some(r => r.pattern === pattern)) {
      CONTAMINATION_RULES.push({ pattern, language: 'lexicon', severity: 'medium', suggestion: entry.pahari, explanation: 'Avoid Hindi "' + word + '", use Pahari "' + entry.pahari + '"' });
    }
  }
}

export const SUNO_RULES = {
  limits: { lyrics: 5000, style: 1000, title: 100 },
  requiredSections: ['[Intro]', '[Verse', '[Chorus]'],
  recommendedSections: ['[Bridge]', '[Outro]'],
  styleRules: {
    firstSentenceLanguage: 'Himachali Pahari',
    mustContain: ['naati', 'dhol', 'nagara'],
    bpm: { min: 90, max: 105 },
    forbidPhrases: ['crisp snare on the backbeat', 'crisp snare', 'backbeat'],
    forbidWords: ['bhangra'],
    tagVocabulary: [
      '[flute trill]', '[bansuri melody]', '[acoustic guitar fill]', '[soft electric guitar fill]',
      '[dhol accents]', '[valley echo]', '[male vocals with folk ornamentation]', '[group vocal harmony]',
      '[full band, naati dance rhythm]', '[acoustic guitar strumming]', '[high-pitched flute melody]',
      '[steady dhol kick]', '[chimta metallic chime]', '[electric guitar crunch]', '[dhol heartbeat]',
      '[raw mountain voice]', '[foot stomp rhythm]', '[nagara beat]',
    ],
  },
};

export const SONG_PATTERNS = {
  form: 'O…/Ho… call-and-answer with callback last line',
  structure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Verse 3', 'Verse 4', 'Chorus', 'Outro'],
  tropeChains: [
    'white teeth → red chunnru in wind → jhumku swaying → mela dancing',
    'deodar shade → moonlight → waiting on path → heart longing',
    'snowy peaks → village path → dhol rhythm → feet dancing',
  ],
  chorusRule: 'identical hook text on every repetition',
};

export const PROMPT_FRAGMENTS = {
  composerPersona: 'You are a master Himachali Pahari folk songwriter from the Mahasuvi/Sirmauri belt. You create authentic, soulful songs for the Suno v5.5 AI music generation platform.',
  dialectRequirement: 'CRITICAL: Lyrics MUST be in the Mahasuvi/Sirmauri dialect of Himachali Pahari — NOT standard Hindi, NOT Punjabi. Use authentic Pahari words, grammar, and expressions. The dialect must feel authentic to someone from the Shimla/Sirmaur hills.',
  lyricsFormat: 'Use Suno v5.5 tags: [Intro], [Verse 1]-[Verse 4], [Chorus] (identical on each repetition), [Bridge] (quiet shift), [Outro] (fade). Include instrument performance tags and vocal direction tags. The hook/chorus must be memorable and repeatable.',
  styleFormat: 'Style block = comma-separated English descriptor string. Structure: [Genre/Style], [Vocal Type], [Instruments], [Tempo/Key/Mood]. Must open with language hint "sung in Himachali Pahari" as the first sentence. Explicitly name naati as genre. Name dhol and nagara for percussion. No backbeat phrasing. BPM must be stated and fall within 90-105.',
  titleRule: 'Romanized Pahari title, 2-5 words, poetic, not English, not Devanagari.',
  outputContract: 'Respond ONLY with a valid JSON object: {"title": "...", "lyrics": "...", "style": "..."}. No markdown fences. No other text.',
  criticPersona: 'You are a Himachali Pahari language expert specializing in Mahasuvi/Sirmauri dialects. Analyze song lyrics for dialect authenticity.',
  criticOutput: 'Respond with JSON: {"is_authentic": bool, "confidence": 0-1, "issues": [{"excerpt": "...", "problem": "...", "suggestion": "..."}]}',
};
