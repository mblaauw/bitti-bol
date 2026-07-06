// bitti-core.js — pure domain logic for Bitti Bol (Himachali Pahari song studio)
// Ported from the original app; adds column tracking on scan hits + a lyric segmenter
// for inline contamination highlighting. No UI here.

export const LEXICON = [
  { pahari: 'dandru', gloss_en: 'teeth (diminutive -ru)', avoid: ['daant'], tags: ['body'], notes: 'Chitte dandru = white teeth, a beauty trope' },
  { pahari: 'kundu', gloss_en: 'where', avoid: ['kahan'], tags: ['grammar'] },
  { pahari: 'bitti', gloss_en: 'girl / daughter', avoid: ['larki', 'beti'], tags: ['people'] },
  { pahari: 'ghughuti', gloss_en: 'a bird (songbird)', avoid: ['chidiya'], tags: ['nature'] },
  { pahari: 'rouni', gloss_en: 'night', avoid: ['raat'], tags: ['time'] },
  { pahari: 'banjar', gloss_en: 'barren / fallow land', avoid: [], tags: ['nature'] },
  { pahari: 'bagaich', gloss_en: 'garden', avoid: ['bagh'], tags: ['nature'] },
  { pahari: 'shimle', gloss_en: 'Shimla (oblique case)', avoid: ['shimla'], tags: ['place'] },
  { pahari: 'dharampur', gloss_en: 'a town / village name', avoid: [], tags: ['place'] },
  { pahari: 'kamru', gloss_en: 'a mythological fort / place', avoid: [], tags: ['place'] },
  { pahari: 'manjh', gloss_en: 'in / inside', avoid: ['ch', 'vich', 'de naal'], tags: ['grammar'], notes: 'Use "manjh" not "ch" or "vich" for "in"' },
  { pahari: 'minjo', gloss_en: 'to me', avoid: ['mainu', 'mujhe'], tags: ['grammar'] },
  { pahari: 'herda', gloss_en: 'watching / looking', avoid: ['dekhda'], tags: ['verb'] },
  { pahari: 'jaalu', gloss_en: 'when', avoid: ['jadon', 'jab'], tags: ['grammar'] },
  { pahari: 'katha', gloss_en: 'talk / story', avoid: ['gallan'], tags: ['noun'] },
  { pahari: 'ri', gloss_en: 'genitive feminine suffix', avoid: ['di'], tags: ['grammar'], notes: '"ri" not "di" for feminine genitive' },
  { pahari: 'ra', gloss_en: 'genitive masculine suffix', avoid: ['da'], tags: ['grammar'], notes: '"ra" not "da" for masculine genitive' },
  { pahari: 're', gloss_en: 'genitive oblique suffix', avoid: ['de'], tags: ['grammar'], notes: '"re" not "de" for oblique genitive' },
  { pahari: 'sheeli', gloss_en: 'cold / cool', avoid: ['thandi'], tags: ['adj'] },
  { pahari: 'graan', gloss_en: 'village', avoid: ['pind', 'gaon'], tags: ['place'] },
  { pahari: 'chunnru', gloss_en: 'a red dupatta / scarf (diminutive)', avoid: ['dupatta'], tags: ['clothing'] },
  { pahari: 'jhumku', gloss_en: 'earring (diminutive)', avoid: ['bali'], tags: ['clothing'] },
  { pahari: 'mela', gloss_en: 'village fair', avoid: ['mela (acceptable)'], tags: ['culture'] },
  { pahari: 'naati', gloss_en: 'Pahari folk dance / song genre', avoid: ['bhangra'], tags: ['music'] },
  { pahari: 'deodar', gloss_en: 'Himalayan cedar tree', avoid: [], tags: ['nature'] },
  { pahari: 'pahari', gloss_en: 'of the mountains / Pahari people', avoid: [], tags: ['identity'] },
];

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
  { pattern: '\\braat\\b', language: 'hindi', severity: 'medium', suggestion: 'rouni', explanation: 'Hindi "raat" = night; use Pahari "rouni"' },
  { pattern: '\\blarki\\b', language: 'hindi', severity: 'medium', suggestion: 'bitti', explanation: 'Hindi "larki" = girl; use Pahari "bitti"' },
];

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

// === VALIDATORS ===

export function validateMechanical(lyrics, style) {
  const warnings = [];
  const lc = lyrics.length;
  const sc = style.length;

  if (lc > SUNO_RULES.limits.lyrics) warnings.push({ code: 'lyrics_overflow', severity: 'high', message: 'Lyrics exceed ' + SUNO_RULES.limits.lyrics + ' chars (' + lc + '). Suno may truncate.' });
  if (sc > SUNO_RULES.limits.style) warnings.push({ code: 'style_overflow', severity: 'high', message: 'Style exceeds ' + SUNO_RULES.limits.style + ' chars (' + sc + '). Suno may truncate.' });

  for (const tag of SUNO_RULES.requiredSections) {
    if (tag === '[Verse') {
      if (!lyrics.match(/\[Verse\s*\d+\]/i)) warnings.push({ code: 'missing_' + tag, severity: 'high', message: 'Missing required section: [Verse N]' });
    } else {
      if (!lyrics.includes(tag)) warnings.push({ code: 'missing_' + tag, severity: 'high', message: 'Missing required section: ' + tag });
    }
  }
  for (const tag of SUNO_RULES.recommendedSections) {
    if (!lyrics.includes(tag)) warnings.push({ code: 'missing_' + tag, severity: 'medium', message: 'Consider adding ' + tag + ' for better suno structure' });
  }

  // Chorus consistency
  const chorusSections = [];
  const lines = lyrics.split('\n');
  let inChorus = false;
  let currentChorus = [];
  for (const line of lines) {
    if (/\[Chorus\]/i.test(line) || /\[Chorus\s*\d*\]/i.test(line)) {
      if (inChorus && currentChorus.length) chorusSections.push(currentChorus.join('\n').trim());
      inChorus = true;
      currentChorus = [];
      continue;
    }
    if (inChorus) {
      if (/^\[/.test(line.trim())) {
        if (currentChorus.length) chorusSections.push(currentChorus.join('\n').trim());
        inChorus = false;
        currentChorus = [];
        continue;
      }
      currentChorus.push(line);
    }
  }
  if (inChorus && currentChorus.length) chorusSections.push(currentChorus.join('\n').trim());
  if (chorusSections.length > 1) {
    const normalized = chorusSections.map(c => c.replace(/\s+/g, ' ').trim());
    const first = normalized[0];
    for (let i = 1; i < normalized.length; i++) {
      if (normalized[i] !== first) warnings.push({ code: 'chorus_mismatch', severity: 'medium', message: 'Chorus ' + (i + 1) + ' differs from first Chorus. Suno v5.5 works best with identical hooks.' });
    }
  }

  // Style checks
  const styleLower = style.toLowerCase();
  const firstSentence = style.split(/[,.]/)[0]?.trim().toLowerCase() || '';
  if (!firstSentence.includes('himachali') && !firstSentence.includes('pahari')) {
    warnings.push({ code: 'style_language_hint', severity: 'medium', message: 'Style block should open with a language hint (e.g. "sung in Himachali Pahari")' });
  }
  for (const word of SUNO_RULES.styleRules.mustContain) {
    if (!styleLower.includes(word)) warnings.push({ code: 'style_missing_' + word, severity: 'medium', message: 'Style block should mention "' + word + '" for authentic Pahari sound' });
  }
  const bpmMatch = style.match(/\b(\d{2,3})\s*bpm\b/i);
  if (bpmMatch) {
    const bpm = parseInt(bpmMatch[1]);
    if (bpm < SUNO_RULES.styleRules.bpm.min || bpm > SUNO_RULES.styleRules.bpm.max) {
      warnings.push({ code: 'style_bpm', severity: 'medium', message: 'BPM ' + bpm + ' outside recommended range (' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max + ') for naati rhythm' });
    }
  } else {
    warnings.push({ code: 'style_bpm_missing', severity: 'medium', message: 'Style block should include a BPM range within ' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max });
  }
  for (const phrase of SUNO_RULES.styleRules.forbidPhrases) {
    if (styleLower.includes(phrase.toLowerCase())) warnings.push({ code: 'style_backbeat', severity: 'medium', message: 'Avoid "' + phrase + '" (bhangra attractor). Use "dhol" and "nagara" phrasing instead.' });
  }

  const isValid = warnings.filter(w => w.severity === 'high').length === 0;
  return { warnings, isValid };
}

export function runContaminationScan(lyrics) {
  const hits = [];
  const lines = (lyrics || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^\[.*\]$/.test(trimmed)) continue;
    for (const rule of CONTAMINATION_RULES) {
      const re = new RegExp(rule.pattern, 'gi');
      let m;
      while ((m = re.exec(line)) !== null) {
        // Context guard: skip lone "de" when it's part of "de naal" phrase
        if (rule.pattern === '\\bde\\b') {
          const after = line.slice(m.index + m[0].length);
          if (/^\s+naal\b/i.test(after)) { re.lastIndex = m.index + m[0].length; continue; }
          if (/^(\s+de\b)/i.test(after)) { re.lastIndex = m.index + m[0].length; continue; }
        }
        hits.push({
          match: m[0],
          col: m.index,
          line: line.trim(),
          lineNo: i + 1,
          language: rule.language,
          severity: rule.severity,
          suggestion: rule.suggestion,
          explanation: rule.explanation,
          pattern: rule.pattern,
        });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }
  // De-duplicate: sort by (lineNo, col), then by match length descending.
  // Keep only the first hit per (lineNo, col) start position (longest match wins).
  hits.sort((a, b) => (a.lineNo - b.lineNo) || (a.col - b.col) || (b.match.length - a.match.length));
  const deduped = [];
  const seen = {};
  for (const h of hits) {
    const key = h.lineNo + ':' + h.col;
    if (seen[key]) continue;
    seen[key] = true;
    deduped.push(h);
  }
  return deduped;
}

export function applyReplacement(text, pattern, replacement, lineNo, col) {
  if (lineNo != null && col != null) {
    const lines = text.split('\n');
    const idx = lineNo - 1;
    if (idx >= 0 && idx < lines.length) {
      const l = lines[idx];
      const re = new RegExp(pattern, 'i');
      const m = re.exec(l.slice(col));
      if (m) {
        const before = l.slice(0, col);
        const after = l.slice(col + m[0].length);
        lines[idx] = before + replacement + after;
      }
      return lines.join('\n');
    }
  }
  const re = new RegExp(pattern, 'gi');
  return text.replace(re, replacement);
}

// Split lyrics into renderable lines for the manuscript view.
// Returns [{type:'tag'|'blank'|'line', ...}]. Line objects carry segments
// where hit segments reference the index of the hit in `hits`.
export function segmentLyrics(lyrics, hits) {
  const lines = (lyrics || '').split('\n');
  const byLine = {};
  (hits || []).forEach((h, idx) => {
    (byLine[h.lineNo] = byLine[h.lineNo] || []).push({ ...h, idx });
  });
  return lines.map((line, i) => {
    const lineNo = i + 1;
    const trimmed = line.trim();
    if (/^\[.*\]$/.test(trimmed)) return { type: 'tag', text: trimmed };
    if (trimmed === '') return { type: 'blank' };
    const lh = (byLine[lineNo] || []).slice().sort((a, b) => a.col - b.col);
    if (!lh.length) return { type: 'line', segments: [{ text: line, hit: false }] };
    const segs = [];
    let pos = 0;
    for (const h of lh) {
      if (h.col < pos) continue; // overlap guard
      if (h.col > pos) segs.push({ text: line.slice(pos, h.col), hit: false });
      segs.push({ text: line.slice(h.col, h.col + h.match.length), hit: true, idx: h.idx, severity: h.severity, language: h.language, suggestion: h.suggestion });
      pos = h.col + h.match.length;
    }
    if (pos < line.length) segs.push({ text: line.slice(pos), hit: false });
    return { type: 'line', segments: segs };
  });
}

// === LLM ADAPTER (OpenAI-compatible /chat/completions) ===
export async function llmCall(cfg, slot, systemPrompt, userPrompt, { expectJson = true } = {}) {
  const isComposer = slot === 'composer';
  const timeoutMs = isComposer ? 90000 : 60000;

  if (!cfg || !cfg.apiKey) return { ok: false, errorKind: 'auth', message: 'No API key configured for ' + slot + ' — set it in Settings.' };
  if (!cfg.baseUrl) return { ok: false, errorKind: 'auth', message: 'No base URL configured for ' + slot + ' — set it in Settings.' };

  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  let url = baseUrl + '/chat/completions';
  if (cfg.corsProxy) {
    url = cfg.corsProxy + encodeURIComponent(url);
  }

  const body = {
    model: cfg.model || 'deepseek-v4-flash',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    temperature: cfg.temperature ?? (isComposer ? 0.85 : 0.2),
    max_tokens: cfg.maxTokens ?? (isComposer ? 4000 : 2000),
  };
  if (expectJson) body.response_format = { type: 'json_object' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (resp.status === 401 || resp.status === 403) {
      const msg = await resp.text().catch(() => '');
      return { ok: false, errorKind: 'auth', message: 'Key rejected (' + resp.status + '). Verify your API key.' + (msg ? ' ' + msg.slice(0, 200) : '') };
    }
    if (resp.status === 429) {
      return { ok: false, errorKind: 'rate_limit', message: 'Rate limited. Wait a moment and retry.' };
    }
    if (!resp.ok) {
      const msg = await resp.text().catch(() => '');
      return { ok: false, errorKind: 'provider_error', message: 'Provider error (' + resp.status + ')' + (msg ? ': ' + msg.slice(0, 300) : '') };
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    const finish = data?.choices?.[0]?.finish_reason;

    if (!content) {
      if (finish === 'length') return { ok: false, errorKind: 'bad_json', message: 'Response empty (max_tokens too short or reasoning ate tokens). Try increasing max_tokens.' };
      return { ok: false, errorKind: 'bad_json', message: 'Empty response from model.' };
    }

    if (!expectJson) return { ok: true, data: content };

    let json;
    try {
      const cleaned = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      json = JSON.parse(cleaned);
    } catch (e) {
      return { ok: false, errorKind: 'bad_json', message: 'Failed to parse response as JSON. Raw: ' + content.slice(0, 300) };
    }
    return { ok: true, data: json };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') return { ok: false, errorKind: 'timeout', message: 'Request timed out after ' + (timeoutMs / 1000) + 's.' };
    const msg = e.message || String(e);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS') || msg.includes('network')) {
      return { ok: false, errorKind: 'cors_or_network', message: 'Network/CORS error. The provider may not allow browser calls. Set a proxy base URL in Settings.' };
    }
    return { ok: false, errorKind: 'provider_error', message: msg };
  }
}

export function assemblePrompt(prefs, userLexicon = [], includeLexicon = true) {
  const fullLex = [...LEXICON, ...(userLexicon || [])];
  const lexBlock = includeLexicon ? fullLex.map(e => e.pahari + ' = ' + e.gloss_en + (e.avoid?.length ? ' (avoid: ' + e.avoid.join(', ') + ')' : '')).join('\n') : '';
  const rulesBlock = 'Style rules:\n- First sentence: "sung in Himachali Pahari"\n- Must name genre as naati\n- Percussion: dhol and nagara (no backbeat phrasing)\n- BPM: ' + SUNO_RULES.styleRules.bpm.min + '-' + SUNO_RULES.styleRules.bpm.max + '\n- No bhangra references\n';
  const structureBlock = 'Structure: ' + SONG_PATTERNS.structure.join(' → ') + '\nForm: ' + SONG_PATTERNS.form + '\nTrope chains: ' + SONG_PATTERNS.tropeChains.join('; ') + '\nChorus rule: ' + SONG_PATTERNS.chorusRule + '\n';

  const userLines = [];
  userLines.push('Create a Himachali Pahari folk song about: ' + prefs.topic);
  if (prefs.mood) userLines.push('Mood: ' + prefs.mood);
  if (prefs.occasion) userLines.push('Occasion: ' + prefs.occasion);
  if (prefs.instruments) userLines.push('Incorporate these instruments: ' + prefs.instruments);
  if (prefs.notes) userLines.push('Additional guidance: ' + prefs.notes);
  userLines.push('\nRemember: Lyrics in authentic Mahasuvi/Sirmauri Pahari. Style in English. Output ONLY valid JSON.');

  return {
    system: PROMPT_FRAGMENTS.composerPersona + '\n\n' + PROMPT_FRAGMENTS.dialectRequirement + '\n\n## Pahari Lexicon (use these)\n' + lexBlock + '\n\n## ' + rulesBlock + '\n\n## ' + structureBlock + '\n\n## Output Format\n' + PROMPT_FRAGMENTS.titleRule + '\n' + PROMPT_FRAGMENTS.lyricsFormat + '\n' + PROMPT_FRAGMENTS.styleFormat + '\n' + PROMPT_FRAGMENTS.outputContract,
    user: userLines.join('\n'),
  };
}

export function assembleCriticPrompt(lyrics) {
  const lexBlock = LEXICON.map(e => e.pahari + ' = ' + e.gloss_en).join('\n');
  const rulesBlock = CONTAMINATION_RULES.filter(r => r.severity === 'high').map(r => r.pattern + ' (' + r.language + ' ' + r.severity + ') → ' + r.suggestion).join('\n');
  return {
    system: PROMPT_FRAGMENTS.criticPersona + '\n\nLexicon:\n' + lexBlock + '\n\nKnown contamination patterns:\n' + rulesBlock + '\n\n' + PROMPT_FRAGMENTS.criticOutput,
    user: 'Validate these lyrics:\n\n' + lyrics.slice(0, 3000),
  };
}

if (typeof window !== 'undefined') {
  window.__BITTIBOL_CORE = { LEXICON, CONTAMINATION_RULES, SUNO_RULES, SONG_PATTERNS, PROMPT_FRAGMENTS, llmCall, segmentLyrics, runContaminationScan, assemblePrompt, validateMechanical, applyReplacement, assembleCriticPrompt };
}
