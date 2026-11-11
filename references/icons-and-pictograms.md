# Carbon icons and pictograms for Svelte

Use this when choosing, importing, sizing, or making Carbon SVG assets accessible. This project currently declares:

| Package                    | Declared version | Role                                                                              |
| -------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `carbon-icons-svelte`      | `^13.18.0`       | Compact icons for controls, navigation, status, and inline meaning.               |
| `carbon-pictograms-svelte` | `^13.21.0`       | Larger illustrative assets for empty states, onboarding, and explanatory content. |

These version ranges are observed project dependencies, not stable API guarantees. Verify resolved versions with `node -p "require('./node_modules/carbon-icons-svelte/package.json').version"` and the equivalent pictograms command.

## Finding assets and importing

- Browse the installed package's `.svelte` component files under `node_modules/<package>/lib/` for the exact available names. For example, `Add.svelte` maps to `carbon-icons-svelte/lib/Add.svelte`.
- The packages' README files link to upstream icon and pictogram indexes. They are useful for visual selection; verify the exact component exists in the installed package before using it.
- Prefer direct imports to avoid pulling a huge barrel into the application and slowing development:

```svelte
<script lang="ts">
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import Analytics from 'carbon-pictograms-svelte/lib/Analytics.svelte';
</script>

<Add size={20} />
<Analytics />
```

- The root barrel imports may be rewritten by Carbon's optional `optimizeImports` preprocessor. Do not assume it is configured; use direct imports unless its presence and behavior are confirmed. Don't add a preprocessor or dependencies just for a single icon.
- Keep the Svelte filename, export name, and case exactly as present in the installed package. For variants (filled, outline, size-specific), confirm the exact installed filename rather than guessing.

## Choosing and sizing

- Use icons for compact, functional or semantic UI. Prefer Carbon component-provided icon APIs when available; they preserve the component's intended spacing, alignment, and interaction behavior.
- Use pictograms for illustrative communication, not as substitutes for small control icons or as decoration on every card. Prefer one when it clarifies an empty state, onboarding moment, or concept.
- Carbon icon design sizes are typically 16, 20, 24, and 32 px. `carbon-icons-svelte` documents a default size of 16; set `size` explicitly where needed to match the surrounding component. Use sizes supported by the installed component declarations.
- Pictograms are typically larger illustrations. Their component API may not have the icon `size` prop: inspect its installed `.svelte.d.ts` and source. Use a wrapper or CSS sizing only when necessary and ensure the asset remains legible and proportionate.
- Avoid emoji, hand-authored SVGs, and ad hoc icon fonts when a suitable Carbon asset exists. Do not use icons alone to carry critical meaning where a text label is needed.

## Accessibility

- The installed packages mark an SVG hidden from assistive technology when it has no accessible label. For decorative use next to visible text, leave it unlabelled so it does not repeat the text to screen readers.
- For a meaningful standalone illustration, give the SVG an appropriate accessible name using the installed component's supported `title`, `aria-label`, or `aria-labelledby` API. Check source/types because prop support differs between icon and pictogram packages.
- A standalone SVG is not a button. For an icon-only action, use a Carbon interactive component (for example, the matching icon button API) and give the control itself an accessible name; do not rely on an SVG's title to label a surrounding button. Prefer visible text when it fits.
- Do not make decorative SVGs keyboard-focusable. Use focusability only if the graphic itself is intentionally interactive and has a complete keyboard-accessible interaction; usually the containing control should own focus instead.
- Preserve adequate contrast, target size, and focus indication on the interactive control. Never communicate state or status by color alone.

## API verification

Before implementation, inspect both the chosen component and package README:

```sh
node -p "require('./node_modules/carbon-icons-svelte/package.json').version"
node -p "require('./node_modules/carbon-pictograms-svelte/package.json').version"
rg -n 'export.*(Add|Analytics)|CarbonIconProps|CarbonPictogramProps' node_modules/carbon-icons-svelte/lib/index.d.ts node_modules/carbon-pictograms-svelte/lib/index.d.ts
```

Then inspect `lib/<ExactName>.svelte.d.ts` and, when needed, `lib/<ExactName>.svelte`. Documentation can lag the installed package. Avoid guessing exports, props, or icon component APIs.

## Sources

- [carbon-icons-svelte repository](https://github.com/carbon-design-system/carbon-icons-svelte)
- [carbon-pictograms-svelte repository](https://github.com/carbon-design-system/carbon-pictograms-svelte)
- Installed package READMEs and component declarations are the authoritative local sources for the currently resolved versions.
