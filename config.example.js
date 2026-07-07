// Rename to config.js and fill in your API keys.
// Keys here override localStorage values on every page load.
// config.js is gitignored — your keys stay local.
window.__BITTIBOL_CONFIG = {
  corsProxy: 'http://localhost:3000/api/', // auto-set for dev; remove for file:// usage
  composer: {
    apiKey: 'sk-...',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    model: 'deepseek-v4-flash',
  },
  critic: {
    apiKey: 'sk-...',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    model: 'deepseek-v4-flash',
  },
};
