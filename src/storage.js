export const STORAGE_KEY = 'bitti-bol:v2';
export const LEGACY_KEY = 'bitti-bol-history';
export const DEFAULT_SETTINGS = {
  composer: { baseUrl: 'https://opencode.ai/zen/go/v1', apiKey: '', model: 'deepseek-v4-flash', temperature: 0.85, maxTokens: 4000 },
  critic: { baseUrl: 'https://opencode.ai/zen/go/v1', apiKey: '', model: 'deepseek-v4-flash', temperature: 0.2, maxTokens: 2000 },
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
      _storage = { ..._storage, ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) } };
      if (Array.isArray(parsed.history)) _v2localHistory = parsed.history;
    }
  }
} catch {}
if (typeof window.__BITTIBOL_CONFIG !== 'undefined') {
  const cfg = window.__BITTIBOL_CONFIG;
  if (cfg.composer) { if (cfg.composer.apiKey) _storage.settings.composer.apiKey = cfg.composer.apiKey; if (cfg.composer.baseUrl) _storage.settings.composer.baseUrl = cfg.composer.baseUrl; if (cfg.composer.model) _storage.settings.composer.model = cfg.composer.model; }
  if (cfg.critic) { if (cfg.critic.apiKey) _storage.settings.critic.apiKey = cfg.critic.apiKey; if (cfg.critic.baseUrl) _storage.settings.critic.baseUrl = cfg.critic.baseUrl; if (cfg.critic.model) _storage.settings.critic.model = cfg.critic.model; }
  if (cfg.corsProxy) _storage.settings.corsProxy = cfg.corsProxy;
}
export let initialHistory;
if (_v2localHistory.length) { initialHistory = _v2localHistory; }
else { initialHistory = migrateV1History(); }

export function saveStorage() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_storage)); } catch {} }
