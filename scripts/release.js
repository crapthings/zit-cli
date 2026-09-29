#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const args = process.argv.slice(2);
const releaseType = args.find((arg) => !arg.startsWith('-')) || 'patch';
const dryRun = args.includes('--dry-run');

if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error('Usage: npm run release -- [patch|minor|major] [--dry-run]');
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  return options.capture ? result.stdout.trim() : '';
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version: ${version}`);
  }
  return match.slice(1).map(Number);
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function bump(version, type) {
  let [major, minor, patch] = parseVersion(version);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const publishedOutput = run(
  'npm',
  ['view', packageJson.name, 'version', '--json'],
  { capture: true }
);
const publishedVersion = JSON.parse(publishedOutput);
const nextPublishedVersion = bump(publishedVersion, releaseType);
const nextVersion = compareVersions(packageJson.version, nextPublishedVersion) >= 0
  ? packageJson.version
  : nextPublishedVersion;

if (nextVersion !== packageJson.version) {
  packageJson.version = nextVersion;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

console.log(`Releasing ${packageJson.name}@${nextVersion}${dryRun ? ' (dry run)' : ''}`);
run('npm', ['test']);
run('npm', ['publish', '--access', 'public', ...(dryRun ? ['--dry-run'] : [])]);
