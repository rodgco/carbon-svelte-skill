# Carbon Svelte Skill

An agent skill for building and reviewing accessible Svelte interfaces with [Carbon Components Svelte](https://github.com/carbon-design-system/carbon-components-svelte). It combines Carbon implementation guidance, a locally searchable upstream documentation snapshot, icon and pictogram guidance, and scripts to refresh the snapshot safely.

## Install

Install with the [skills.sh](https://skills.sh) CLI:

```sh
npx skills add rodgco/carbon-svelte-skill
```

To install specifically for supported agents:

```sh
npx skills add rodgco/carbon-svelte-skill --agent claude-code cursor
```

The repository root contains `SKILL.md`, so no skill selector is necessary. The package has no npm dependencies; Node.js 18+ is required for the refresh script.

## Included tooling

From the installed skill directory:

```sh
# Discover and read a focused documentation section
node scripts/lookup.mjs --list input
node scripts/lookup.mjs Button --start 161 --limit 160

# Refresh the upstream documentation snapshot and regenerate the index
node scripts/refresh.mjs

# Validate lookup behavior
node --test scripts/lookup.test.mjs
```

`refresh.mjs` downloads the official [Carbon Svelte LLM reference](https://svelte.carbondesignsystem.com/llms-full.txt), validates it, atomically replaces the local snapshot, records its provenance, and regenerates the index. Review the resulting diff before committing.

## Contents

- `SKILL.md` — workflow and implementation guidance.
- `references/llms-full.txt` — upstream documentation snapshot.
- `references/index.md` — generated section index with line ranges.
- `references/icons-and-pictograms.md` — selection and accessibility guidance.
- `scripts/lookup.mjs` — paginated local documentation lookup.
- `scripts/refresh.mjs` — snapshot refresh and provenance updater.

## License

MIT. The bundled Carbon documentation snapshot remains subject to its upstream terms and licensing.
