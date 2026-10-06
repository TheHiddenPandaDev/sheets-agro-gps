const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const exportBlock = /\nif \(typeof module !== 'undefined'\) \{[\s\S]*?\n\}\n?$/;

function stripExports(file) {
  return fs.readFileSync(path.join(src, file), 'utf8').replace(exportBlock, '\n');
}

function bundle() {
  const sidebar = fs.readFileSync(path.join(src, 'sidebar.html'), 'utf8');
  return [
    stripExports('core.js').trimEnd(),
    stripExports('Code.js').trimEnd(),
    'const SIDEBAR_HTML = ' + JSON.stringify(sidebar) + ';',
  ].join('\n\n') + '\n';
}

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'Code.gs'), bundle());
fs.copyFileSync(path.join(src, 'appsscript.json'), path.join(dist, 'appsscript.json'));
process.stdout.write('dist/Code.gs and dist/appsscript.json written\n');
