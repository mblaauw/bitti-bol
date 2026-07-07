# Bitti Bol — Himachali Pahari Song Studio

Browser app for composing Himachali Pahari folk songs with Suno v5.5. No server required.

## How to use

### Dev mode (served)
```bash
npm run dev     # or: python3 -m http.server
```
Open `http://localhost:3000` (or wherever served), click the gear icon to add an API key, enter a topic, and generate.

### Distributable (file://)
```bash
npm run build   # produces dist/bitti-bol.html
```
Open `dist/bitti-bol.html` directly from Chrome/Edge — works offline (except CDN deps) and from GitHub Pages.

## API key setup

Set keys in the Settings modal (stored in localStorage) or create a `config.js` file:

```js
window.__BITTIBOL_CONFIG = {
  composer: { apiKey: 'sk-...', baseUrl: 'https://opencode.ai/zen/go/v1', model: 'deepseek-v4-flash' },
  critic: { apiKey: 'sk-...', baseUrl: 'https://opencode.ai/zen/go/v1', model: 'deepseek-v4-flash' },
};
```

`config.js` is gitignored — copy from `config.example.js`.

## CORS proxy

Opening from `file://` blocks API fetch calls. Set a CORS proxy URL in Settings. The proxy will see your API key — only use one you control.

## Tests

```bash
npm test                          # Playwright UI smoke tests (13)
node --test tests/core.test.mjs   # Core logic regression tests (15)
```

## Architecture

```
bitti-bol/
├── index.html               # Dev entry (import map, loads src/main.js)
├── src/
│   ├── main.js              # Bootstrap: render App
│   ├── state.js             # Signals, effects, pipeline
│   ├── storage.js           # localStorage, config merge
│   ├── constants.js         # CONTAMINATION_RULES, SUNO rules, prompts
│   ├── lexicon.js           # 90-entry Pahari lexicon
│   ├── core/                # Pure domain logic (scanner, validators, LLM, prompts)
│   ├── components/          # Preact UI components (one per file)
│   └── styles.css           # All CSS
├── scripts/build.mjs        # Inlines src/ → dist/bitti-bol.html
├── dist/bitti-bol.html      # Single-file distribution (file:// compatible)
├── config.js                # (gitignored) API keys
└── config.example.js        # Template for config.js
```
