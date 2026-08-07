<script lang="ts">
	/** Renders a legend explaining the stroke symbols that are used in the patterns of the given tunes. */
	export default {};
</script>

<script setup lang="ts">
	import config from "../../config";
	import { Tune } from "../../state/tune";
	import { getUsedStrokes } from "../../state/sheet";
	import { computed } from "vue";

	const props = defineProps<{
		tunes: Tune[];
	}>();

	const entries = computed(() => getUsedStrokes(props.tunes)
		.filter((stroke) => config.strokesDescription[stroke])
		.map((stroke) => ({
			stroke,
			display: config.strokes[stroke] ?? stroke,
			description: config.strokesDescription[stroke]!()
		}))
	);
</script>

<template>
	<div v-if="entries.length > 0" class="bb-sheet-legend">
		<ul>
			<li v-for="entry in entries" :key="entry.stroke">
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

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
			columns: 4;
			font-size: 7pt;
		}

		.bb-sheet-legend-symbol {
			display: inline-block;
			min-width: 5mm;
			margin-right: 1.5mm;
			font-weight: bold;
		}
	}
</style>
