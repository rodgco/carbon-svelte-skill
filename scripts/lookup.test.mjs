import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./lookup.mjs', import.meta.url));
function run(...args) {
	return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', cwd: tmpdir() });
}

test('lists matching sections independently of current directory', () => {
	const result = run('--list', 'button');
	assert.equal(result.status, 0);
	assert.match(result.stdout, /^Button\t\d+-\d+$/m);
	assert.doesNotMatch(result.stdout, /^Checkbox\t/m);
});

test('looks up exact names case-insensitively and paginates', () => {
	const result = run('button', '--limit', '4');
	assert.equal(result.status, 0);
	assert.match(result.stdout, /section lines 1-4 of \d+/);
	assert.match(result.stdout, /## Button/);
	assert.match(result.stdout, /--start 5 --limit 4/);
	const next = run('Button', '--start', '5', '--limit', '4');
	assert.equal(next.status, 0);
	assert.match(next.stdout, /section lines 5-8/);
});

test('validates input instead of silently returning incorrect docs', () => {
	for (const args of [
		['MissingComponent'],
		['Button', '--start', '0'],
		['Button', '--limit', '-1'],
		['Button', '--limit'],
		['Button', '--unknown', '2'],
		['Button', '--start', '999999'],
		['Button', '--start', '9007199254740992'],
		['--list', 'no-such-component']
	]) {
		const result = run(...args);
		assert.equal(result.status, 1, args.join(' '));
		assert.ok(result.stderr.trim());
	}
});

test('generated index covers the snapshot contiguously and records its checksum', () => {
	const index = readFileSync(new URL('../references/index.md', import.meta.url), 'utf8');
	const text = readFileSync(new URL('../references/llms-full.txt', import.meta.url), 'utf8');
	assert.ok(index.includes(createHash('sha256').update(text).digest('hex')));
	const rows = [...index.matchAll(/^\| (.+) \| (\d+) \| (\d+) \|$/gm)];
	assert.ok(rows.length > 100);
	let expectedStart = 1;
	for (const [, , start, end] of rows) {
		assert.equal(Number(start), expectedStart);
		assert.ok(Number(end) >= Number(start));
		expectedStart = Number(end) + 1;
	}
	const lines = text.split(/\r?\n/);
	if (lines.at(-1) === '') lines.pop();
	assert.equal(expectedStart - 1, lines.length);
});
