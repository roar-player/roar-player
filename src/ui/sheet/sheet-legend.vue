<script lang="ts">
	/** Renders a legend explaining the stroke symbols that are used in the patterns of the given tunes. */
	export default {};
</script>

<script setup lang="ts">
	import config, { Instrument } from "../../config";
	import { Tune } from "../../state/tune";
	import { getUsedStrokes } from "../../state/sheet";
	import { getInstrumentsLabel } from "../utils/condensed-annotations";
	import { computed } from "vue";

	const props = defineProps<{
		tunes: Tune[];
	}>();

	const entries = computed(() => {
		// Strokes are configured per instrument, so the same symbol can mean different things on different
		// instruments. Group the used strokes by their display symbol, and within a symbol by description.
		const bySymbol = new Map<string, Map<string, Instrument[]>>();
		for (const { instrument, stroke } of getUsedStrokes(props.tunes)) {
			const strokeConfig = config.instruments[instrument].strokes[stroke];
			if (strokeConfig?.description) {
				const description = strokeConfig.description();
				const byDescription = bySymbol.get(strokeConfig.display) ?? new Map<string, Instrument[]>();
				bySymbol.set(strokeConfig.display, byDescription);
				byDescription.set(description, [...(byDescription.get(description) ?? []), instrument]);
			}
		}
		return [...bySymbol.entries()].map(([display, byDescription]) => {
			// A symbol that means the same everywhere gets a plain description; an ambiguous one prefixes
			// each meaning with its instruments like the annotations do, separated by ";" since the
			// instrument names themselves are comma-separated, e.g. “Repi: Flare; Snare, Choci: Accent”
			const description = byDescription.size === 1
				? [...byDescription.keys()][0]
				: [...byDescription.entries()]
					.map(([description, instruments]) => `${getInstrumentsLabel(instruments)}: ${description}`)
					.join("; ");
			return {
				display,
				description,
				// Entries with a long text span several grid tracks so that they don't wrap awkwardly
				span: description.length > 62 ? 3 : description.length > 30 ? 2 : 1
			};
		});
	});
</script>

<template>
	<div v-if="entries.length > 0" class="bb-sheet-legend">
		<ul>
			<li v-for="entry in entries" :key="`${entry.display} ${entry.description}`" :class="`bb-sheet-legend-span-${entry.span}`">
				<span class="bb-sheet-legend-symbol">{{entry.display}}</span>
				<span class="bb-sheet-legend-description">{{entry.description}}</span>
			</li>
		</ul>
	</div>
</template>

<style lang="scss">
	.bb-sheet-legend {
		break-inside: avoid;
		color: #888;
		border-top: 0.5pt solid #bbb;
		padding-top: 1mm;
		margin-top: 2mm;

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			// dense packing fills the gaps that the wider entries leave at the row ends
			grid-auto-flow: row dense;
			column-gap: 3mm;
			font-size: 7pt;
		}

		.bb-sheet-legend-span-2 {
			grid-column: span 2;
		}

		.bb-sheet-legend-span-3 {
			grid-column: span 3;
		}

		.bb-sheet-legend-symbol {
			display: inline-block;
			min-width: 5mm;
			margin-right: 1.5mm;
			font-weight: bold;
		}
	}
</style>
