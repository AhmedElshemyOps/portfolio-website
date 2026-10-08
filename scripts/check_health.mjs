// Run the local release checks in order: publishing tests use temporary fixtures.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const python = process.env.PORTFOLIO_PYTHON || 'python3';
const checks = [
  ['Article and website tests', python, ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py']],
  ...readdirSync(new URL('../tests/', import.meta.url))
    .filter(name => /^test_.*\.(cjs|mjs)$/.test(name)).sort()
    .map(name => [name, process.execPath, [`tests/${name}`]]),
  ['Pinned prompt sources', python, ['scripts/sync_hotel_prompts.py', '--check']],
  ['Shared templates and bundles', python, ['scripts/render_shared.py', '--check']],
  ['Local links and fragments', python, ['scripts/validate_site_links.py']],
  ['Article navigation', python, ['maintenance/validate-navigation.py']],
];

const failed = [];
for (const [name, command, args] of checks) {
  console.log(`\nChecking: ${name}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0 || result.error) failed.push(name);
}
console.log(`\n${checks.length - failed.length}/${checks.length} check groups passed.`);
if (failed.length) {
  console.error(`Needs attention: ${failed.join(', ')}`);
  process.exitCode = 1;
}
