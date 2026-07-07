#!/usr/bin/env node
// Build: inline all src/ modules into a single dist/bitti-bol.html (file:// compatible).
// Strips local import/export, hoists the three CDN imports, concatenates in dependency order.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const p = (...a) => path.join(root, ...a);

const ORDER = [
  'src/lexicon.js',
  'src/constants.js',
  'src/core/prompts.js',
  'src/core/scanner.js',
  'src/core/validators.js',
  'src/storage.js',
  'src/state.js',
  'src/components/App.js',
  'src/components/ChecksGrid.js',
  'src/components/ContaminationPanel.js',
  'src/components/ErrorBanner.js',
  'src/components/HistoryPanel.js',
  'src/components/InputForm.js',
  'src/components/LexiconModal.js',
  'src/components/LyricsReadMode.js',
  'src/components/PipelineCard.js',
  'src/components/SettingsModal.js',
  'src/components/SongCard.js',
  'src/components/StageList.js',
  'src/main.js',
];

function strip(src) {
  const out = [];
  for (const line of src.split('\n')) {
    if (/^\s*import\s.+from\s+['"].+['"];?\s*$/.test(line)) continue;
    if (/^\s*import\s+['"].+['"];?\s*$/.test(line)) continue;
    if (/^\s*export\s*\{[^}]*\}\s*(from\s*['"][^'"]+['"])?\s*;?\s*$/.test(line)) continue;
    if (/^\s*export\s+default\s+/.test(line)) continue;
    out.push(line.replace(/^(\s*)export\s+(const|let|var|function|class|async)\b/, '$1$2'));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

let bodies = '';
for (const f of ORDER) bodies += '\n\n' + strip(await readFile(p(f), 'utf8'));
const css = await readFile(p('src/styles.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>${css}</style>
<title>Bitti Bol — Himachali Pahari Song Studio</title>
</head>
<body>
<div id="app"></div>
<script src="config.js"></script>
<script type="importmap">
{
  "imports": {
    "preact": "https://esm.sh/preact@10.26.4",
    "preact/": "https://esm.sh/preact@10.26.4/"
  }
}
</script>
<script type="module">import { h, render } from 'preact';
import { computed, effect, signal } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import htm from 'https://esm.sh/htm@3.1.1';
const html = htm.bind(h);
${bodies}
</script>
</body>
</html>
`;

await mkdir(p('dist'), { recursive: true });
await writeFile(p('dist/bitti-bol.html'), html);
console.log('Built dist/bitti-bol.html (' + html.length + ' bytes)');
