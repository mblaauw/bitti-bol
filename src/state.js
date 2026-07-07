import { signal, effect } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import { _storage, initialHistory, saveStorage, DEFAULT_SETTINGS } from './storage.js';
import { runContaminationScan, validateMechanical, llmCall, assemblePrompt, assembleCriticPrompt } from './core/index.js';
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
  { key: 'repair', label: 'Repair', blurb: 'Targeted dialect fixes' },
];

export function pushStep(name, status, msg) {
  const stages = pipelineSteps.value;
  const existing = stages.find(s => s.name === name);
  if (existing) { existing.status = status; existing.message = msg || ''; pipelineSteps.value = [...stages]; }
  else { pipelineSteps.value = [...stages, { name, status, message: msg || '' }]; }
}

export async function runPipeline(prefs) {
  pipelineError.value = null;
  pipelineSteps.value = [];
  pushStep('compose', 'active', 'Calling composer…');

  const withProxy = (cfg) => settings.value.corsProxy ? { ...cfg, corsProxy: settings.value.corsProxy } : cfg;
  const prompts = assemblePrompt(prefs, userLexiconSig.value);
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
    const cp = assembleCriticPrompt(d.lyrics);
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

  let repairApplied = false, afterHigh = highHits, finalLyrics = d.lyrics;
  const needRepair = (critic && critic.is_authentic === false && (critic.confidence || 0) < 0.7) || highHits > 0;
  if (needRepair) {
    pushStep('repair', 'active', 'Applying fixes…');
    const issues = [];
    for (const h of scan) if (h.severity === 'high') issues.push('- Line ' + h.lineNo + ': "' + h.match + '" (' + h.language + ') → ' + h.suggestion);
    if (critic && critic.issues) for (const iss of critic.issues) issues.push('- "' + (iss.excerpt || '') + '": ' + (iss.problem || '') + ' → ' + (iss.suggestion || ''));
    const rp = 'The following lyrics have dialect issues. Fix ONLY the flagged constructions with the suggested Pahari forms. Keep the title, structure, tags, and all other lines byte-identical. Return the same JSON shape {title, lyrics, style}.\n\nOriginal lyrics:\n' + d.lyrics + '\n\nIssues:\n' + issues.join('\n');
    const rr = await llmCall(withProxy(settings.value.composer), 'composer', 'You are a Himachali Pahari dialect editor. ' + PROMPT_FRAGMENTS.dialectRequirement, rp);
    if (rr.ok && rr.data.lyrics && rr.data.lyrics.length) {
      finalLyrics = rr.data.lyrics; repairApplied = true;
      afterHigh = runContaminationScan(finalLyrics).filter(h => h.severity === 'high').length;
      mech = validateMechanical(finalLyrics, d.style);
      pushStep('repair', 'done', 'high ' + highHits + ' → ' + afterHigh);
    } else {
      pushStep('repair', 'done', rr.ok ? 'kept original' : 'failed · kept original');
    }
  } else {
    pushStep('repair', 'skipped', 'nothing to fix');
  }

  const finalScan = runContaminationScan(finalLyrics);
  const report = { mechanical: mech, scan: finalScan, critic, repair: repairApplied ? { applied: true, beforeHigh: highHits, afterHigh } : null };
  const record = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), title: d.title, lyrics: finalLyrics,
    style: d.style, topic: prefs.topic, prefs, report, pipelineVersion: 2,
  };
  songLyrics.value = finalLyrics; scanHits.value = finalScan; songReport.value = report;
  history.value = [record, ...history.value].slice(0, 50);
}
