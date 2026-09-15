#!/usr/bin/env node
import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '.');
const packagePath = path.join(target, 'package.json');

function normalizeBin(bin) {
  if (!bin) return [];
  if (typeof bin === 'string') return [['bin', bin]];
  if (typeof bin === 'object' && !Array.isArray(bin)) return Object.entries(bin);
  throw new Error('package.json "bin" must be a string or object');
}

function fail(message) {
  console.error(`pkg-bin-doctor: ${message}`);
  process.exitCode = 1;
}

try {
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  const bins = normalizeBin(packageJson.bin);

  if (bins.length === 0) {
    fail('no package.json "bin" entries found');
  }

  for (const [command, relativeFile] of bins) {
    if (typeof relativeFile !== 'string' || relativeFile.trim() === '') {
      fail(`bin "${command}" must point to a file path`);
      continue;
    }

    const file = path.resolve(target, relativeFile);
    const details = await stat(file).catch(() => null);
    if (!details?.isFile()) {
      fail(`bin "${command}" points to missing file: ${relativeFile}`);
      continue;
    }

    const firstLine = (await readFile(file, 'utf8')).split(/\r?\n/, 1)[0];
    if (!firstLine.startsWith('#!')) {
      fail(`bin "${command}" is missing a shebang: ${relativeFile}`);
    }

    if (process.platform !== 'win32') {
      try {
        await access(file, constants.X_OK);
      } catch {
        fail(`bin "${command}" is not executable: ${relativeFile}`);
      }
    }
  }

  if (!process.exitCode) {
    console.log(`pkg-bin-doctor: ${bins.length} bin entr${bins.length === 1 ? 'y' : 'ies'} OK`);
  }
} catch (error) {
  fail(error.message);
}
