import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = path.resolve('bin/pkg-bin-doctor.js');

async function fixture(binFile) {
  const dir = await mkdtemp(path.join(tmpdir(), 'pkg-bin-doctor-'));
  await mkdir(path.join(dir, 'bin'));
  await writeFile(path.join(dir, 'package.json'), JSON.stringify({ bin: { demo: 'bin/demo.js' } }));
  await writeFile(path.join(dir, 'bin/demo.js'), binFile);
  await chmod(path.join(dir, 'bin/demo.js'), 0o755);
  return dir;
}

test('passes when bin target exists and has a shebang', async () => {
  const dir = await fixture('#!/usr/bin/env node\nconsole.log("ok")\n');
  const result = spawnSync(process.execPath, [cli, dir], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /1 bin entry OK/);
});

test('fails when bin target has no shebang', async () => {
  const dir = await fixture('console.log("no shebang")\n');
  const result = spawnSync(process.execPath, [cli, dir], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing a shebang/);
});
