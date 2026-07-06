import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf-8');

function collectJS(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectJS(full));
    else if (entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

const jsFiles = collectJS(path.join(root, 'src'));
// Order: htm.js, constants.js, lexicon.js, core/*, storage.js, state.js, components/*, main.js
jsFiles.sort((a, b) => {
  const name = p => p.replace(root + '/src/', '');
  const order = ['htm.js', 'lexicon.js', 'constants.js', 'core/', 'storage.js', 'state.js', 'components/', 'main.js'];
  const idx = (n) => { for (let i = 0; i < order.length; i++) { if (n.startsWith(order[i]) || n.includes(order[i])) return i; } return order.length; };
  return idx(name(a)) - idx(name(b));
});

// Collect all external imports (merged by module) and all non-import code
const moduleImports = {}; // module specifier -> Set of imported names
const importHacks = [];   // default imports (import X from '...')
const codeLines = [];

for (const f of jsFiles) {
  const code = fs.readFileSync(f, 'utf-8');
  for (const rawLine of code.split('\n')) {
    const line = rawLine;
    const trimmed = line.trim();

    // Strip local import/export-re-export lines (./ or ../ paths)
    if ((trimmed.startsWith('import ') || trimmed.startsWith('export ')) && (trimmed.includes('\'./') || trimmed.includes('"./') || trimmed.includes('\'../') || trimmed.includes('"../'))) continue;

    // Collect external imports (bare specifiers), merged by module
    if (trimmed.startsWith('import ')) {
      const m = trimmed.match(/import\s+(?:(\{[^}]+\})|(\S+))\s+from\s+['"]([^'"]+)['"]/);
      if (m) {
        const module = m[3];
        if (module === 'preact' || module.startsWith('https://') || module === 'htm') {
          if (m[2]) { // default import
            if (!importHacks.includes(trimmed)) importHacks.push(trimmed);
          } else if (m[1]) { // named imports
            if (!moduleImports[module]) moduleImports[module] = new Set();
            const names = m[1].replace(/[{}]/g, '').split(',').map(s => s.trim());
            for (const n of names) moduleImports[module].add(n);
          }
          continue;
        }
      }
    }

    // Remove `export ` prefix but handle `export default` → keep the value
    const processed = (/^export\s+default\s+/.test(trimmed)) ? trimmed.replace(/^export\s+default\s+/, '').replace(/;\s*$/, '') + ';' : line.replace(/\bexport\s+/, '');
    codeLines.push(processed);
  }
}

const importLines = [];
for (const [mod, names] of Object.entries(moduleImports)) {
  const sorted = [...names].sort();
  importLines.push('import { ' + sorted.join(', ') + ' } from \'' + mod + '\';');
}
importLines.push(...importHacks);
const moduleCode = importLines.join('\n') + '\n' + codeLines.join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${css}</style>
<title>Bitti Bol — Himachali Pahari Song Studio</title>
</head>
<body>
<div id="app"></div>
<script src="config.js"></script>
<script src="lexicon.js"></script>
<script type="importmap">
{
  "imports": {
    "preact": "https://esm.sh/preact@10.26.4",
    "preact/": "https://esm.sh/preact@10.26.4/"
  }
}
</script>
<script type="module">${moduleCode}
</script>
</body>
</html>`;

const distDir = path.join(root, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'bitti-bol.html'), html);
console.log('Built: dist/bitti-bol.html (' + (html.length / 1024).toFixed(1) + ' KB)');
