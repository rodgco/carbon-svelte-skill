#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceUrl = 'https://svelte.carbondesignsystem.com/llms-full.txt';
const reference = new URL('../references/llms-full.txt', import.meta.url);
const readme = new URL('../references/README.md', import.meta.url);
const lookup = new URL('./lookup.mjs', import.meta.url);
const usage = `Usage: node refresh.mjs

Downloads the official Carbon Svelte LLM reference, atomically replaces the local
snapshot, updates provenance in references/README.md, and regenerates index.md.`;

function replaceProvenance(readmeText, provenance) {
	const start = '<!-- refresh-provenance:start -->';
	const end = '<!-- refresh-provenance:end -->';
	const startIndex = readmeText.indexOf(start);
	const endIndex = readmeText.indexOf(end);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error('Could not find the provenance markers in references/README.md.');
	}
	const block = [
		start,
		'## Current snapshot',
		'',
		`- **File:** \`llms-full.txt\``,
		`- **Origin:** [Carbon Components Svelte documentation](${sourceUrl})`,
		`- **Exact source URL:** ${sourceUrl}`,
		`- **Retrieved (UTC):** ${provenance.retrievedAt}`,
		`- **HTTP Last-Modified:** ${provenance.lastModified ?? 'not supplied by the server'}`,
		`- **HTTP ETag:** ${provenance.etag ?? 'not supplied by the server'}`,
		'- **Documentation version:** not declared in the upstream LLM reference; verify against the installed package.',
		`- **SHA-256:** \`${provenance.sha256}\``,
		'',
		end
	].join('\n');
	return `${readmeText.slice(0, startIndex)}${block}${readmeText.slice(endIndex + end.length)}`;
}

async function main(args) {
	if (args.includes('--help')) {
		console.log(usage);
		return;
	}
	if (args.length) throw new Error('refresh.mjs takes no arguments.');

	const response = await fetch(sourceUrl, {
		headers: { 'user-agent': 'carbon-svelte-skill-reference-refresh' }
	});
	if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
	const text = await response.text();
	if (!text.trim() || !text.startsWith('# Carbon Components Svelte')) {
		throw new Error('Downloaded content is not the expected Carbon Svelte reference. Local files were not changed.');
	}

	const snapshotPath = fileURLToPath(reference);
	const temporaryPath = `${snapshotPath}.${randomUUID()}.tmp`;
	const sha256 = createHash('sha256').update(text).digest('hex');
	try {
		writeFileSync(temporaryPath, text, 'utf8');
		renameSync(temporaryPath, snapshotPath);
	} finally {
		rmSync(temporaryPath, { force: true });
	}

	const indexed = spawnSync(process.execPath, [fileURLToPath(lookup), '--index'], {
		encoding: 'utf8'
	});
	if (indexed.status !== 0) throw new Error(indexed.stderr.trim() || 'Could not regenerate the reference index.');

	const provenance = {
		retrievedAt: new Date().toISOString(),
		lastModified: response.headers.get('last-modified'),
		etag: response.headers.get('etag'),
		sha256
	};
	writeFileSync(readme, replaceProvenance(readFileSync(readme, 'utf8'), provenance));
	console.log(`Refreshed ${snapshotPath}`);
	console.log(`SHA-256: ${sha256}`);
	console.log(indexed.stdout.trim());
}

main(process.argv.slice(2)).catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
