import { signal, effect } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import { _storage, initialHistory, saveStorage, DEFAULT_SETTINGS } from './storage.js';
import { runContaminationScan, validateMechanical, llmCall, submitGeneration, pollGeneration, assembleComposerPrompt, assembleCriticPrompt, PROMPT_VERSION } from './core/index.js';
import { PROMPT_FRAGMENTS } from './constants.js';

export const settings = signal(_storage.settings);
export const formTopic = signal('');
export const formMood = signal('');
export const formOccasion = signal('');
export const formInstruments = signal('');
export const formNotes = signal('');
export const pipelineError = signal(null);
export const pipelineSteps = signal([]);
export const songTitle = signal('');
export const songLyrics = signal('');
export const songStyle = signal('');
export const songReport = signal(null);
export const scanHits = signal([]);
export const userLexiconSig = signal(_storage.userLexicon || []);
export const showSettings = signal(false);
export const showLexicon = signal(false);
export const showExportImport = signal(false);
export const history = signal(initialHistory);
export const copyFeedback = signal({ title: false, style: false, lyrics: false });
export const editMode = signal(false);
export const hoveredHit = signal(null);
export const audioGen = signal({ status: 'idle', taskId: null, tracks: [], error: null, generations: [], activeGen: -1 });
export const showSunoConfirm = signal(false);
export const pendingSunoArgs = signal(null);
export const selectedHistoryId = signal(null);

effect(() => { _storage.settings = settings.value; _storage.history = history.value; _storage.userLexicon = userLexiconSig.value; saveStorage(); });

let scanTimer = null;
export function scheduleScan(text) {
  clearTimeout(scanTimer);
  if (!text.trim()) { scanHits.value = []; return; }
  scanTimer = setTimeout(() => {
    scanHits.value = runContaminationScan(text);
  }, 400);
}

export const STAGES = [
  { key: 'compose', label: 'Compose', blurb: 'LLM writes the song' },
  { key: 'validate', label: 'Validate', blurb: 'Suno structure rules' },
  { key: 'scan', label: 'Scan', blurb: 'Dialect contamination' },
  { key: 'critic', label: 'Critic', blurb: 'LLM authenticity check' },
  { key: 'revise', label: 'Revise', blurb: 'Fix issues from critic feedback' },
  { key: 'verify', label: 'Verify', blurb: 'Second critic pass' },
];

export function pushStep(name, status, msg) {
  const stages = pipelineSteps.value;
  const existing = stages.find(s => s.name === name);
  if (existing) { existing.status = status; existing.message = msg || ''; pipelineSteps.value = [...stages]; }
  else { pipelineSteps.value = [...stages, { name, status, message: msg || '' }]; }
}

export async function generateAudio(title, style, lyrics, instrumental) {
  const prevGens = audioGen.value.generations || [];
  audioGen.value = { status: 'submitting', taskId: null, tracks: [], error: null, generations: prevGens, activeGen: -1 };
  const cfg = settings.value.generation;
  const sub = await submitGeneration(cfg, title, style, lyrics, instrumental);
  if (!sub.ok) {
    audioGen.value = { status: 'error', taskId: null, tracks: [], error: sub, generations: prevGens, activeGen: -1 };
    return;
  }
  const taskId = sub.data.taskId;
  audioGen.value = { status: 'polling', taskId, tracks: [], error: null, generations: prevGens, activeGen: -1 };
  const result = await pollGeneration(cfg, taskId, (status) => {
    audioGen.value = { ...audioGen.value, status: status === 'SUCCESS' ? 'done' : 'polling' };
  });
  if (!result.ok) {
    audioGen.value = { status: 'error', taskId, tracks: [], error: result, generations: prevGens, activeGen: -1 };
    return;
  }
  const model = cfg.model || 'V5_5';
  const entry = { tracks: result.data.tracks, taskId, createdAt: new Date().toISOString(), model, instrumental };
  const gens = [...prevGens, entry];
  const activeGen = gens.length - 1;
  audioGen.value = { status: 'done', taskId, tracks: result.data.tracks, error: null, generations: gens, activeGen };
  const saveAudio = (record) => ({ ...record, audio: gens });
  const hId = selectedHistoryId.value;
  if (hId) {
    const idx = history.value.findIndex(r => r.id === hId);
    if (idx !== -1) {
      const copy = [...history.value];
      copy[idx] = saveAudio(copy[idx]);
      history.value = copy;
      return;
    }
  }
  const matchIdx = history.value.findIndex(r => r.title === title && r.lyrics === lyrics && r.style === style);
  if (matchIdx !== -1) {
    const copy = [...history.value];
    copy[matchIdx] = saveAudio(copy[matchIdx]);
    history.value = copy;
  } else {
    const record = {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), title, lyrics,
      style: style || '', topic: '', prefs: {}, report: null, pipelineVersion: 3,
      audio: gens,
    };
    selectedHistoryId.value = record.id;
    history.value = [record, ...history.value].slice(0, 50);
  }
}

export function selectGeneration(index) {
  const gens = audioGen.value.generations;
  if (!gens || index < 0 || index >= gens.length) return;
  audioGen.value = { ...audioGen.value, activeGen: index, tracks: gens[index].tracks, taskId: gens[index].taskId };
}

export async function runPipeline(prefs) {
  if (typeof window !== 'undefined' && window.__testFailApi) {
    pipelineError.value = { ok: false, errorKind: 'auth', message: 'Test: No API key configured' };
    pushStep('compose', 'failed', 'Test: No API key configured');
    return;
  }
  pipelineError.value = null;
  pipelineSteps.value = [];
  pushStep('compose', 'active', 'Calling composer…');

  const withProxy = (cfg) => settings.value.corsProxy ? { ...cfg, corsProxy: settings.value.corsProxy } : cfg;
  const prompts = assembleComposerPrompt(prefs, userLexiconSig.value);
  const result = await llmCall(withProxy(settings.value.composer), 'composer', prompts.system, prompts.user);
  if (!result.ok) {
    pushStep('compose', 'failed', result.message);
    pipelineError.value = result;
    return;
  }
  const d = result.data;
  if (!d.title || !d.lyrics || !d.style) {
    pushStep('compose', 'failed', 'Incomplete: missing title/lyrics/style');
    pipelineError.value = { errorKind: 'bad_json', message: 'Model returned incomplete data. Try again.' };
    return;
  }
  pushStep('compose', 'done', '');
  songTitle.value = d.title; songLyrics.value = d.lyrics; songStyle.value = d.style;
  scanHits.value = runContaminationScan(d.lyrics);

  pushStep('validate', 'active', '');
  let mech = validateMechanical(d.lyrics, d.style);
  pushStep('validate', 'done', mech.warnings.length ? (mech.warnings.length + ' note' + (mech.warnings.length !== 1 ? 's' : '')) : 'clean');

  pushStep('scan', 'active', '');
  const scan = runContaminationScan(d.lyrics);
  const highHits = scan.filter(h => h.severity === 'high').length;
  pushStep('scan', 'done', scan.length ? (highHits + ' high · ' + (scan.length - highHits) + ' med') : 'clean');

  let critic = null;
  if (settings.value.criticEnabled) {
    pushStep('critic', 'active', '');
    const cp = assembleCriticPrompt(d.lyrics, d.title, d.style);
    const cr = await llmCall(withProxy(settings.value.critic), 'critic', cp.system, cp.user);
    if (cr.ok) {
      critic = cr.data;
      const conf = (critic.confidence || 0);
      pushStep('critic', 'done', (critic.is_authentic ? 'authentic' : 'issues') + ' · ' + conf.toFixed(2));
    } else {
      pushStep('critic', 'skipped', 'unavailable');
    }
  } else {
    pushStep('critic', 'skipped', 'disabled');
  }

  let iterations = 0;
  let finalLyrics = d.lyrics;
  let finalCritic = critic;
  const MAX_ITERATIONS = 2;

  const shouldRevise = settings.value.criticEnabled && critic && critic.confidence !== undefined &&
    (critic.confidence < 0.8 || !critic.is_authentic);

  if (shouldRevise) {
    pushStep('revise', 'active', '');

    const issues = [];
    for (const h of scan) {
      if (h.severity === 'high') {
        issues.push(`- Line ${h.lineNo}: "${h.match}" (${h.language}) → ${h.suggestion}`);
      }
    }
    if (critic.issues) {
      for (const iss of critic.issues) {
        issues.push(`- "${iss.excerpt || ''}": ${iss.problem || ''} → ${iss.suggestion || ''}`);
      }
    }

    const conf = critic.confidence || 0;
    let revisionType;
    if (conf < 0.6) revisionType = 'full';
    else if (conf < 0.8) revisionType = 'targeted';
    else revisionType = 'scrub';

    const typeGuide = revisionType === 'full'
      ? 'Perform a thorough revision addressing all issues.'
      : revisionType === 'targeted'
        ? 'Focus on the specific issues listed below. Keep everything else intact.'
        : 'Quick vocabulary scrub — fix only the specific word substitutions listed below.';

    const rp = `${PROMPT_FRAGMENTS.iterativeImprovement}

ORIGINAL SONG:
Title: ${d.title}
Style: ${d.style}
Lyrics:
${d.lyrics}

REVISION TYPE: ${revisionType}
${typeGuide}

ISSUES TO ADDRESS:
${issues.join('\n')}

${PROMPT_FRAGMENTS.outputContract}`;

    const rr = await llmCall(withProxy(settings.value.composer), 'composer',
      PROMPT_FRAGMENTS.iterativeImprovement + '\n' + PROMPT_FRAGMENTS.dialectRequirement, rp);
    if (rr.ok && rr.data && rr.data.lyrics && rr.data.lyrics.length) {
      finalLyrics = rr.data.lyrics;
      iterations = 1;
      const afterReviseScan = runContaminationScan(finalLyrics);
      const afterHigh = afterReviseScan.filter(h => h.severity === 'high').length;
      pushStep('revise', 'done', `${revisionType} · high ${highHits}→${afterHigh}`);

      if (settings.value.criticEnabled && iterations < MAX_ITERATIONS) {
        pushStep('verify', 'active', '');
        const vp = assembleCriticPrompt(finalLyrics, d.title, d.style);
        const vr = await llmCall(withProxy(settings.value.critic), 'critic', vp.system, vp.user);
        if (vr.ok) {
          finalCritic = vr.data;
          const vconf = finalCritic.confidence || 0;
          pushStep('verify', 'done', (finalCritic.is_authentic ? 'authentic' : 'issues') + ' · ' + vconf.toFixed(2));
        } else {
          pushStep('verify', 'skipped', 'unavailable');
        }
      } else {
        pushStep('verify', 'skipped', 'disabled');
      }
    } else {
      pushStep('revise', 'done', 'kept original');
      pushStep('verify', 'skipped', 'not needed');
    }
  } else {
    pushStep('revise', 'skipped', critic ? 'approved' : 'no critic data');
    pushStep('verify', 'skipped', 'not needed');
  }

  const finalScan = runContaminationScan(finalLyrics);
  const report = { mechanical: mech, scan: finalScan, critic: finalCritic, iterations };
  const recordId = crypto.randomUUID();
  const record = {
    id: recordId, createdAt: new Date().toISOString(), title: d.title, lyrics: finalLyrics,
    style: d.style, topic: prefs.topic, prefs, report, pipelineVersion: 3,
    metadata: { prompt_version: PROMPT_VERSION, generated_at: new Date().toISOString() },
  };
  songLyrics.value = finalLyrics; scanHits.value = finalScan; songReport.value = report;
  selectedHistoryId.value = recordId;
  history.value = [record, ...history.value].slice(0, 50);
}
