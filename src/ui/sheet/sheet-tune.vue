<script lang="ts">
	/** Renders the printable sheet of a single tune: its description, all its patterns and a legend of the used strokes. */
	export default {};
</script>

<script setup lang="ts">
	import config from "../../config";
	import defaultTunes from "../../defaultTunes";
	import { Tune } from "../../state/tune";
	import { computed } from "vue";
	import SheetPattern from "./sheet-pattern.vue";
	import SheetLegend from "./sheet-legend.vue";
	import { getLocalizedDisplayName, getTuneDescriptionHtml, useI18n } from "../../services/i18n";

	const props = withDefaults(defineProps<{
		tuneName: string;
		tune: Tune;
		showLegend?: boolean;
	}>(), {
		showLegend: true
	});

	const i18n = useI18n();

	const displayName = computed(() => getLocalizedDisplayName(props.tune.displayName || props.tuneName));

	const speed = computed(() => props.tune.speed ?? config.defaultSpeed);

	const descriptionHtml = computed(() => {
		const descriptionFilename = defaultTunes[props.tuneName]?.descriptionFilename;
		return descriptionFilename ? getTuneDescriptionHtml(descriptionFilename) : undefined;
	});

	const exampleSongTexts = computed(() => props.tune.exampleSong?.map((song) => song.map((entry) => {
		if (typeof entry === "string") {
			return getLocalizedDisplayName(entry);
		}
		const patternName = getLocalizedDisplayName(entry.patternName);
		return entry.tuneName != null ? `${getLocalizedDisplayName(entry.tuneName)}: ${patternName}` : patternName;
	}).join(" – ")));
</script>

<template>
	<section class="bb-sheet-tune">
		<header class="bb-sheet-tune-header">
			<h1>{{displayName}}</h1>
			<span class="bb-sheet-tune-speed">♩&nbsp;=&nbsp;{{i18n.t("sheet.speed", { bpm: speed })}}</span>
		</header>

		<div v-if="descriptionHtml" class="bb-sheet-tune-description" v-html="descriptionHtml"></div>

		<SheetPattern
			v-for="(pattern, patternName) in tune.patterns"
			:key="patternName"
			:patternName="String(patternName)"
			:pattern="pattern"
		/>

		<p v-for="(songText, songIdx) in exampleSongTexts" :key="songIdx" class="bb-sheet-tune-example-song">
			<strong>{{i18n.t("sheet.example-song")}}:</strong>{{" "}}{{songText}}
		</p>

		<SheetLegend v-if="showLegend" :tunes="[tune]" />
	</section>
</template>

<style lang="scss">
	.bb-sheet-tune {
		.bb-sheet-tune-header {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			border-bottom: 4px double #000;
			margin-bottom: 3mm;

			h1 {
				font-size: 18pt;
				font-weight: bold;
				margin: 0;
			}

			.bb-sheet-tune-speed {
				font-size: 9pt;
				color: #888;
				white-space: nowrap;
			}
		}

		.bb-sheet-tune-description {
			font-size: 9pt;
			margin-bottom: 3mm;

			img {
				max-height: 30mm;
				width: auto;
			}

			h1, h2, h3 {
				font-size: 11pt;
				font-weight: bold;
				margin: 0 0 1mm 0;
			}

			p {
				margin: 0 0 1mm 0;
			}

			a {
				color: inherit;
				text-decoration: none;
			}
		}

		.bb-sheet-tune-example-song {
			font-size: 9pt;
			margin: 0 0 3mm 0;
		}
	}
</style>
