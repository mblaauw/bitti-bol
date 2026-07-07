export const STORAGE_KEY = 'bitti-bol:v2';
export const LEGACY_KEY = 'bitti-bol-history';
export const DEFAULT_SETTINGS = {
  composer: { baseUrl: 'https://opencode.ai/zen/go/v1', apiKey: '', model: 'deepseek-v4-flash', temperature: 0.85, maxTokens: 16384 },
  critic: { baseUrl: 'https://opencode.ai/zen/go/v1', apiKey: '', model: 'deepseek-v4-flash', temperature: 0.2, maxTokens: 16384 },
  criticEnabled: true, corsProxy: '',
};

function migrateV1History() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const old = JSON.parse(raw);
    if (!Array.isArray(old)) return [];
    return old.map(s => ({
      id: s.id || crypto.randomUUID(), createdAt: s.generated_at || new Date().toISOString(),
      title: s.title || 'Untitled', lyrics: s.lyrics?.content || '', style: s.style?.content || '',
      topic: s.topic || '', prefs: {},
      report: { mechanical: { warnings: [], isValid: true }, scan: [], critic: null, repair: null },
      pipelineVersion: 1,
    }));
  } catch { return []; }
}

export let _storage = { schemaVersion: 2, settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), userLexicon: [] };
let _v2localHistory = [];
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.schemaVersion === 2) {
      const savedSettings = parsed.settings || {};
      _storage = {
        ..._storage, ...parsed,
        settings: {
          ...DEFAULT_SETTINGS,
          composer: { ...DEFAULT_SETTINGS.composer, ...(savedSettings.composer || {}) },
          critic: { ...DEFAULT_SETTINGS.critic, ...(savedSettings.critic || {}) },
          corsProxy: savedSettings.corsProxy ?? DEFAULT_SETTINGS.corsProxy,
          criticEnabled: savedSettings.criticEnabled ?? DEFAULT_SETTINGS.criticEnabled,
        },
      };
      if (Array.isArray(parsed.history)) _v2localHistory = parsed.history;
    }
  }
} catch {}
if (typeof window.__BITTIBOL_CONFIG !== 'undefined') {
  const cfg = window.__BITTIBOL_CONFIG;
  if (cfg.composer) { for (const k of ['apiKey', 'baseUrl', 'model', 'temperature', 'maxTokens']) { if (cfg.composer[k] != null) _storage.settings.composer[k] = cfg.composer[k]; } }
  if (cfg.critic) { for (const k of ['apiKey', 'baseUrl', 'model', 'temperature', 'maxTokens']) { if (cfg.critic[k] != null) _storage.settings.critic[k] = cfg.critic[k]; } }
  if (cfg.corsProxy) _storage.settings.corsProxy = cfg.corsProxy;
}
export let initialHistory;
if (_v2localHistory.length) { initialHistory = _v2localHistory; }
else { initialHistory = migrateV1History(); }

export function saveStorage() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_storage)); } catch {} }
