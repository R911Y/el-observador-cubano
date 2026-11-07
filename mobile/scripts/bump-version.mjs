#!/usr/bin/env node
/**
 * Cambia la versión de la app Android manteniendo sincronizados
 * android/version.properties y package.json, y aumentando versionCode.
 *
 * Uso:
 *   node scripts/bump-version.mjs patch
 *   node scripts/bump-version.mjs minor
 *   node scripts/bump-version.mjs major
 *   node scripts/bump-version.mjs 1.2.0
 *
 * El flujo de release exige que la etiqueta vX.Y.Z coincida con versionName.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const versionFile = join(root, 'android', 'version.properties');
const packageFile = join(root, 'package.json');

const input = (process.argv[2] || '').trim();
if (!input) {
  console.error('Uso: node scripts/bump-version.mjs <patch|minor|major|X.Y.Z>');
  process.exit(1);
}

const raw = readFileSync(versionFile, 'utf8');
const props = Object.fromEntries(
  raw
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const current = props.versionName;
const currentParts = current.split('.').map(Number);
if (currentParts.length !== 3 || currentParts.some((n) => !Number.isInteger(n) || n < 0)) {
  console.error(`versionName actual inválido: ${current}`);
  process.exit(1);
}

let nextParts;
if (input === 'major') {
  nextParts = [currentParts[0] + 1, 0, 0];
} else if (input === 'minor') {
  nextParts = [currentParts[0], currentParts[1] + 1, 0];
} else if (input === 'patch') {
  nextParts = [currentParts[0], currentParts[1], currentParts[2] + 1];
} else if (/^\d+\.\d+\.\d+$/.test(input)) {
  nextParts = input.split('.').map(Number);
} else {
  console.error('Versión inválida. Usa patch, minor, major o MAJOR.MINOR.PATCH.');
  process.exit(1);
}

const next = nextParts.join('.');
const nextCode = Number(props.versionCode || '0') + 1;
if (next === current) {
  console.error('La versión nueva es igual a la actual.');
  process.exit(1);
}

const header = [
  '# Versión única de la aplicación Android.',
  '# La etiqueta de GitHub debe ser v<versionName> y versionCode debe crecer en',
  '# cada APK distribuible. El flujo de release comprueba ambos valores.',
].join('\n');

writeFileSync(
  versionFile,
  `${header}\nversionName=${next}\nversionCode=${nextCode}\n`,
  'utf8'
);

const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
pkg.version = next;
writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

console.log(`Versión: ${current} (code ${props.versionCode}) -> ${next} (code ${nextCode})`);
console.log('Recuerda: git commit, git tag v' + next + ', git push --tags');
