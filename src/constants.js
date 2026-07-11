import LEXICON from './lexicon.js';

export { PROMPT_FRAGMENTS, PROMPT_VERSION } from './prompts/index.js';

export const CONTAMINATION_RULES = [
  // Hindi / Punjabi contamination (always replace)
  { pattern: '\\bmainu\\b', language: 'punjabi', severity: 'high', suggestion: 'manu', explanation: 'Punjabi "mainu" = to me; Seraji uses "manu"' },
  { pattern: '\\btainu\\b', language: 'punjabi', severity: 'high', suggestion: 'tenu', explanation: 'Punjabi "tainu" = to you; Seraji uses "tenu"' },
  { pattern: '\\bmujhe\\b', language: 'hindi', severity: 'high', suggestion: 'manu', explanation: 'Hindi "mujhe" = to me; Seraji uses "manu"' },
  { pattern: '\\bjadon\\b', language: 'punjabi', severity: 'high', suggestion: 'jado', explanation: 'Punjabi "jadon" = when; Seraji uses "jado"' },
  { pattern: '\\bgallan\\b', language: 'punjabi', severity: 'high', suggestion: 'gal', explanation: 'Punjabi "gallan" = talk/stories; Seraji uses "gal"' },
  { pattern: '\\blarki\\b', language: 'hindi', severity: 'high', suggestion: 'kudi', explanation: 'Hindi "larki" = girl; Seraji uses "kudi"' },
  { pattern: '\\blarka\\b', language: 'hindi', severity: 'high', suggestion: 'munda', explanation: 'Hindi "larka" = boy; Seraji uses "munda"' },
  { pattern: '\\btumhara\\b', language: 'hindi', severity: 'medium', suggestion: 'tera / teri', explanation: 'Hindi "tumhara" = your; use Seraji "tera/teri"' },
  { pattern: '\\bkyunki\\b', language: 'hindi', severity: 'medium', suggestion: 'je / ki', explanation: 'Hindi "kyunki" = because; use Seraji "je/ki"' },
  { pattern: '\\blekin\\b', language: 'hindi', severity: 'medium', suggestion: 'par / magar (acceptable)', explanation: 'Hindi "lekin" = but; "par/magar" is Pahari-acceptable' },

  // Sirmauri / Mahasuvi drift — wrong for Seraji
  { pattern: '\\bminjo\\b', language: 'sirmauri', severity: 'high', suggestion: 'manu', explanation: 'Sirmauri "minjo" = to me; Seraji uses "manu"' },
  { pattern: '\\btinjo\\b', language: 'sirmauri', severity: 'high', suggestion: 'tenu', explanation: 'Sirmauri "tinjo" = to you; Seraji uses "tenu"' },
  { pattern: '\\bmanjh\\b', language: 'sirmauri', severity: 'high', suggestion: 'vich', explanation: 'Sirmauri "manjh" = in; Seraji uses "vich"' },
  { pattern: '\\bbitti\\b', language: 'sirmauri', severity: 'high', suggestion: 'kudi', explanation: 'Sirmauri "bitti" = girl; Seraji uses "kudi"' },
  { pattern: '\\bherda\\b', language: 'sirmauri', severity: 'high', suggestion: 'dekhda', explanation: 'Sirmauri "herda" = watching; Seraji uses "dekhda"' },
  { pattern: '\\brouni\\b', language: 'sirmauri', severity: 'high', suggestion: 'raat', explanation: 'Sirmauri "rouni" = night; Seraji uses "raat"' },
  { pattern: '\\bgraan\\b', language: 'sirmauri', severity: 'high', suggestion: 'gaon', explanation: 'Sirmauri "graan" = village; Seraji uses "gaon"' },
  { pattern: '\\bchunnru\\b', language: 'sirmauri', severity: 'high', suggestion: 'chunni', explanation: 'Sirmauri "chunnru" = dupatta; Seraji uses "chunni"' },
  { pattern: '\\bjaalu\\b', language: 'sirmauri', severity: 'high', suggestion: 'jado', explanation: 'Sirmauri "jaalu" = when; Seraji uses "jado"' },
  { pattern: '\\bbhabhi\\b', language: 'sirmauri', severity: 'medium', suggestion: 'bhabo', explanation: 'Sirmauri "bhabhi"; Seraji uses "bhabo"' },
  { pattern: '\\bbaabu\\b', language: 'sirmauri', severity: 'medium', suggestion: 'baap', explanation: 'Sirmauri "baabu" = father; Seraji uses "baap"' },
  { pattern: '\\baama\\b', language: 'sirmauri', severity: 'medium', suggestion: 'amma', explanation: 'Sirmauri "aama" = mother; Seraji uses "amma"' },
  { pattern: '\\bbhailu\\b', language: 'sirmauri', severity: 'medium', suggestion: 'bhai', explanation: 'Sirmauri "bhailu" = brother; Seraji uses "bhai"' },
  { pattern: '\\bbaani\\b', language: 'sirmauri', severity: 'medium', suggestion: 'diya', explanation: 'Sirmauri "baani" = sister; Seraji uses "diya"' },
  { pattern: '\\bbittu\\b', language: 'sirmauri', severity: 'medium', suggestion: 'munda', explanation: 'Sirmauri "bittu" = boy; Seraji uses "munda"' },
  { pattern: '\\bkothi\\b', language: 'sirmauri', severity: 'medium', suggestion: 'bera', explanation: 'Sirmauri "kothi" = house; Seraji uses "bera"' },
  { pattern: '\\bsadku\\b', language: 'sirmauri', severity: 'medium', suggestion: 'rasta', explanation: 'Sirmauri "sadku" = road; Seraji uses "rasta"' },
  { pattern: '\\bdeotha\\b', language: 'sirmauri', severity: 'medium', suggestion: 'Devta', explanation: 'Sirmauri "deotha"; Seraji uses "Devta" (uppercase)' },
  { pattern: '\\bbonna\\b', language: 'sirmauri', severity: 'medium', suggestion: 'hona', explanation: 'Sirmauri "bonna" = to become; Seraji uses "hona"' },
  { pattern: '\\bdouna\\b', language: 'sirmauri', severity: 'medium', suggestion: 'daudna', explanation: 'Sirmauri "douna" = to run; Seraji uses "daudna"' },
  { pattern: '\\bseet\\b', language: 'sirmauri', severity: 'medium', suggestion: 'sardi', explanation: 'Sirmauri "seet" = winter; Seraji uses "sardi"' },
  { pattern: '\\bsyau\\b', language: 'sirmauri', severity: 'medium', suggestion: 'sardi', explanation: 'Sirmauri "syau" = winter; Seraji uses "sardi"' },
  { pattern: '\\bdihu\\b', language: 'sirmauri', severity: 'medium', suggestion: 'din', explanation: 'Sirmauri "dihu" = day; Seraji uses "din"' },
  { pattern: '\\bsheeshu\\b', language: 'sirmauri', severity: 'medium', suggestion: 'sir', explanation: 'Sirmauri "sheeshu" = head; Seraji uses "sir"' },
  { pattern: '\\bthae\\b', language: 'sirmauri', severity: 'medium', suggestion: 'si', explanation: 'Sirmauri "thae" = was; Seraji uses "si"' },

  // Kangri / Punjabi loans — borderline
  { pattern: '\\bpind\\b', language: 'kangri', severity: 'medium', suggestion: 'gaon', explanation: 'Kangri-influenced "pind" = village; Seraji prefers "gaon"' },
  { pattern: '\\bde naal\\b', language: 'punjabi', severity: 'medium', suggestion: 'vich / saath', explanation: 'Punjabi "de naal" = with; rephrase with Seraji "saath" or "vich"' },
];

// Derive medium rules from lexicon avoid terms — Kullui / Seraji / Pahari-General entries only.
// Sirmauri/Mahasuvi entries are intentionally skipped to avoid dialect contradictions.
for (const entry of LEXICON) {
  if (!entry.avoid || !entry.avoid.length) continue;
  const tags = entry.tags || [];
  if (!tags.includes('Kullui') && !tags.includes('Seraji') && !tags.includes('Pahari-General')) continue;
  for (const word of entry.avoid) {
    if (word.includes('(acceptable)')) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = '\\b' + escaped + '\\b';
    if (!CONTAMINATION_RULES.some(r => r.pattern === pattern)) {
      CONTAMINATION_RULES.push({ pattern, language: 'lexicon', severity: 'medium', suggestion: entry.pahari, explanation: 'Avoid "' + word + '", use Seraji "' + entry.pahari + '"' });
    }
  }
}

export const SUNO_RULES = {
  limits: { lyrics: 5000, style: 1000, title: 100 },
  requiredSections: ['[Intro]', '[Verse', '[Chorus]'],
  recommendedSections: ['[Bridge]', '[Outro]'],
  styleRules: {
    firstSentenceLanguage: 'Seraji Himachali Pahari',
    mustContain: ['naati', 'dhol', 'nagada', 'seraji'],
    bpm: { min: 85, max: 100 },
    forbidPhrases: ['crisp snare on the backbeat', 'crisp snare', 'backbeat'],
    forbidWords: ['bhangra'],
    tagVocabulary: [
      '[flute trill]', '[bansuri melody]', '[acoustic guitar fill]', '[soft electric guitar fill]',
      '[dhol accents]', '[valley echo]', '[male vocals with folk ornamentation]', '[group vocal harmony]',
      '[full band, Seraji naati rhythm]', '[acoustic guitar strumming]', '[high-pitched flute melody]',
      '[steady dhol kick]', '[chimta metallic chime]', '[electric guitar crunch]', '[dhol heartbeat]',
      '[raw mountain voice]', '[foot stomp rhythm]', '[nagada beat]',
      '[shehnai call]', '[karnal procession blast]', '[Seraji naati rhythm]', '[dhol dhamal]',
      '[valley chorus]', '[melodic mountain voice]', '[group Devta procession drums]',
      '[slow circular naati steps]', '[Tirthan river flow melody]', '[soft jhampak swing]',
      '[seraji rising-falling intonation]', '[gentle meend glides]', '[banjar valley echo]',
    ],
  },
};

export const SONG_PATTERNS = {
  form: 'O…/Ho… call-and-answer with callback last line',
  structure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Verse 3', 'Verse 4', 'Chorus', 'Outro'],
  tropeChains: [
    'chitte dandru → chunni in Tirthan wind → jhumku swaying → naati at Banjar Mela',
    'kail shade → moonlight on Tirthan River → waiting on rasta → heart longing',
    'snow peaks at Jalori Pass → Jibhi gaon path → dhol rhythm → feet in naati circle',
    'Shringa Devta rath → karnal call → dhol heartbeat → Banjar valley chorus rising',
    'apple orchard → Tirthan riverside → patu draped → evening home in Jibhi',
  ],
  chorusRule: 'identical hook text on every repetition',
};