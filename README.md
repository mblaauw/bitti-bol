# Bitti Bol — Himachali Pahari Song Studio

Single-file browser app for composing Himachali Pahari folk songs with Suno v5.5. No server, no build step.

## How to use

1. Open `bitti-bol.html` in Chrome/Edge (works from `file://` or GitHub Pages)
2. Open **Settings** (gear icon), add your API key for the composer slot
3. Enter a topic and click **Generate song**
4. Review the pipeline results, apply fixes to flagged dialect issues, save to history

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
npm test                    # Playwright UI smoke tests (13)
node --test tests/core.test.mjs  # Core logic regression tests (15)
```

## Architecture

- `bitti-bol.html` — standalone app (Preact + htm + signals via esm.sh)
- All core logic (scanner, validators, LLM adapter, prompt assembly) inlined
- `bitti-core.js` — extracted ESM copy for Node test imports
- `lexicon.js` — optional 90-entry lexicon override (auto-loaded if present)
- `config.js` — optional gitignored API key/config file
