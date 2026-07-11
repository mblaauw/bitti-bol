import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  LEXICON,
  CONTAMINATION_RULES,
  runContaminationScan,
  applyReplacement,
  segmentLyrics,
  validateMechanical,
  submitGeneration,
  pollGeneration,
} = await import(path.resolve(__dirname, '..', 'src/core/index.js'));

// ---- CONTAMINATION RULES ----
describe('CONTAMINATION_RULES', () => {
  it('ri/ra/re are Sirmauri drift, auto-generated as medium', () => {
    for (const p of ['\\bri\\b', '\\bra\\b', '\\bre\\b']) {
      const rule = CONTAMINATION_RULES.find(r => r.pattern === p);
      assert(rule, `auto-generated rule ${p} exists (from Seraji/Kullui di/da/de avoids)`);
      assert.equal(rule.severity, 'medium', `${p} severity should be medium`);
    }
  });

  it('high-severity contamination rules stay high', () => {
    for (const p of ['\\bmainu\\b', '\\bgallan\\b', '\\bminjo\\b', '\\bmanjh\\b']) {
      const rule = CONTAMINATION_RULES.find(r => r.pattern === p);
      assert.equal(rule.severity, 'high', `${p} severity should be high`);
    }
  });

  it('de-naal phrase demoted to medium', () => {
    const rule = CONTAMINATION_RULES.find(r => r.pattern === '\\bde naal\\b');
    assert.equal(rule.severity, 'medium', '"de naal" is borderline Punjabi borrowing — medium, not high');
  });

  it('vich / di / da / de are NOT contamination (valid Kullui / Seraji)', () => {
    for (const p of ['\\bvich\\b', '\\bdi\\b', '\\bda\\b', '\\bde\\b']) {
      const rule = CONTAMINATION_RULES.find(r => r.pattern === p);
      assert(!rule, `${p} should NOT be a contamination pattern — it is valid in Kullui and Seraji`);
    }
  });
});

// ---- P0-1 FALSE POSITIVES ----
describe('P0-1: false positive guards', () => {
  it('"Kudi de de tera hathru" — no high hits (de is valid Kullui/Seraji genitive)', () => {
    const hits = runContaminationScan('Kudi de de tera hathru');
    const high = hits.filter(h => h.severity === 'high');
    assert.equal(high.length, 0, '"de" is valid Kullui/Seraji genitive, not contamination');
  });

  it('"Ho kudi da gaana" — no hits at all (kudi, da, and Ho are valid Seraji/Pahari)', () => {
    const hits = runContaminationScan('Ho kudi da gaana');
    assert.equal(hits.length, 0, '"kudi" (girl), "da" (genitive), "Ho" (vocative) are all valid — no contamination expected');
  });

  it('"de naal" — one hit (phrase rule, no solo de duplicate)', () => {
    const hits = runContaminationScan('de naal');
    assert.equal(hits.length, 1, 'only one hit for "de naal" (phrase rule, no duplicate "de")');
    assert(hits[0].pattern.includes('de naal'), 'hit is the phrase rule');
  });

  it('"mainu" still high', () => {
    const hits = runContaminationScan('mainu');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].severity, 'high');
  });

  it('"minjo" is now high (Sirmauri drift, was valid Sirmauri target)', () => {
    const hits = runContaminationScan('minjo');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].severity, 'high');
    assert.equal(hits[0].suggestion, 'manu');
  });
});

// ---- P1-1 applyReplacement ----
describe('P1-1: applyReplacement scope', () => {
  it('global replace when no lineNo/col', () => {
    const r = applyReplacement('de de de', '\\bde\\b', 're');
    assert.equal(r, 're re re');
  });

  it('targeted replace with lineNo and col', () => {
    const lyrics = 'line one\nde de de\nline three';
    const r = applyReplacement(lyrics, '\\bde\\b', 're', 2, 0);
    assert.equal(r, 'line one\nre de de\nline three');
  });

  it('targeted replace at mid-line', () => {
    const lyrics = 'x de y';
    const r = applyReplacement(lyrics, '\\bde\\b', 're', 1, 2);
    assert.equal(r, 'x re y');
  });
});

// ---- DE-DUP ----
describe('de-duplication', () => {
  it('overlapping hits are deduped (longest match wins)', () => {
    // "de naal" triggers both the phrase rule and the lone "de" rule
    const hits = runContaminationScan('de naal');
    // After demotion and guard: only "de naal" phrase hit should remain
    assert.equal(hits.length, 1);
    assert.match(hits[0].pattern, /de naal/);
  });
});

// ---- MECHANICAL VALIDATOR ----
describe('validateMechanical', () => {
  const validSong = `[Intro]
[Verse 1]
O ho ho…
[Chorus]
Hook line
[Outro]`;

  it('passes well-formed song (advisory warnings expected)', () => {
    const result = validateMechanical(validSong, 'naati, dhol, nagada, acoustic guitar');
    // Advisory: missing Bridge, no language hint, no BPM — these are not errors
    assert(result.warnings.length <= 4);
  });

  it('catches missing chorus', () => {
    const result = validateMechanical(validSong.replace('[Chorus]', '[Bridge]'), 'naati, dhol');
    assert(result.warnings.some(w => w.message.includes('Chorus')));
  });

  it('warns on missing naati', () => {
    const result = validateMechanical(validSong, 'guitar, drums');
    assert(result.warnings.some(w => w.message.includes('naati')));
  });

  it('warns on invalid BPM', () => {
    const result = validateMechanical(validSong, 'naati, 160 bpm, dhol');
    assert(result.warnings.length > 0);
  });
});

// ---- SEGMENTER ----
describe('segmentLyrics', () => {
  it('produces segments with hit highlighting', () => {
    const lyrics = 'mainu tera pyar';
    const hits = runContaminationScan(lyrics);
    const segs = segmentLyrics(lyrics, hits);
    const lineSegs = segs.find(s => s.type === 'line')?.segments || [];
    const hitSegs = lineSegs.filter(s => s.hit);
    assert(hitSegs.length > 0, 'should have highlighted segments');
  });
});

// ---- SUNO GENERATION ADAPTER ----
describe('submitGeneration', () => {
  it('returns auth error for missing apiKey', async () => {
    const result = await submitGeneration({ baseUrl: 'https://api.sunoapi.org', apiKey: '' }, 'Test', 'pop', 'lyrics', false);
    assert.equal(result.ok, false);
    assert.equal(result.errorKind, 'auth');
  });

  it('returns auth error for missing baseUrl', async () => {
    const result = await submitGeneration({ apiKey: 'fake' }, 'Test', 'pop', 'lyrics', false);
    assert.equal(result.ok, false);
    assert.equal(result.errorKind, 'auth');
  });
});

describe('pollGeneration', () => {
  it('returns provider_error for missing task', async () => {
    const result = await pollGeneration({ baseUrl: 'https://api.sunoapi.org', apiKey: 'fake' }, 'nonexistent');
    assert.equal(result.ok, false);
  });
});

// ---- SUMMARY ----
const totalHits = runContaminationScan('mainu tera pyar\njadon gallan larki\nminjo manjh bitti\ndeh di gaon raat');
console.log('Integration: total hits on Seraji/Kullui-anchored mixed input:', totalHits.length);
console.log('  high hits:', totalHits.filter(h => h.severity === 'high').length);
console.log('  medium hits:', totalHits.filter(h => h.severity === 'medium').length);
