const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const now = new Date();
const stamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  '-',
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0'),
].join('');
const outputDir = process.env.ADMIN_RELEASE_DIR || path.join('release', `build-${stamp}`);
const cli = path.join(root, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js');
const args = [cli, `--config.directories.output=${outputDir}`, ...process.argv.slice(2)];

console.log(`Packaging Electron app to ${outputDir}`);

const child = spawn(process.execPath, args, {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
