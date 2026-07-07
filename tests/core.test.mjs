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
} = await import(path.resolve(__dirname, '..', 'src/core/index.js'));

// ---- CONTAMINATION RULES ----
describe('CONTAMINATION_RULES', () => {
  it('di/da/de are medium severity (not high)', () => {
    for (const p of ['\\bde\\b', '\\bda\\b', '\\bdi\\b']) {
      const rule = CONTAMINATION_RULES.find(r => r.pattern === p);
      assert(rule, `rule ${p} exists`);
      assert.equal(rule.severity, 'medium', `${p} severity should be medium`);
    }
  });

  it('phrase rules remain high', () => {
    for (const p of ['\\bde naal\\b', '\\bgallan\\b', '\\bmainu\\b']) {
      const rule = CONTAMINATION_RULES.find(r => r.pattern === p);
      assert.equal(rule.severity, 'high', `${p} severity should be high`);
    }
  });
});

// ---- P0-1 FALSE POSITIVES ----
describe('P0-1: false positive guards', () => {
  it('"Minjo de de tera hathru" — no high hits', () => {
    const hits = runContaminationScan('Minjo de de tera hathru');
    const high = hits.filter(h => h.severity === 'high');
    assert.equal(high.length, 0, 'no high hits for doubled "de"');
  });

  it('"O bitti da gaana" — no high hits (da is medium)', () => {
    const hits = runContaminationScan('O bitti da gaana');
    const high = hits.filter(h => h.severity === 'high');
    assert.equal(high.length, 0, 'no high hits for "da"');
  });

  it('"de naal" — only one hit (phrase rule, no solo de)', () => {
    const hits = runContaminationScan('de naal');
    assert.equal(hits.length, 1, 'only one hit for "de naal" ("de naal" phrase, no duplicate "de")');
    assert(hits[0].pattern.includes('de naal'), 'hit is the phrase rule');
  });

  it('"mainu" still high', () => {
    const hits = runContaminationScan('mainu');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].severity, 'high');
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
    const result = validateMechanical(validSong, 'naati, dhol, nagara, acoustic guitar');
    // Advisory: missing Bridge, no language hint, no BPM — these are not errors
    assert(result.warnings.length <= 3);
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

// ---- SUMMARY ----
const totalHits = runContaminationScan('de de de\nde naal\nmainu jadon gallan');
console.log('Integration: total hits on mixed input:', totalHits.length);
console.log('  high hits:', totalHits.filter(h => h.severity === 'high').length);
console.log('  medium hits:', totalHits.filter(h => h.severity === 'medium').length);
