<script lang="ts">
	/**
	 * The view behind the #/sheet/ routes: renders the printable sheet of a single tune (#/sheet/:tuneName) or a
	 * booklet of all tunes (#/sheet/). It is rendered without the usual app navigation and is optimized for being
	 * printed (or converted to PDF, see scripts/generate-sheets.mjs) on A4 portrait pages.
	 */
	export default {};

	declare global {
		interface Window {
			/** The list of available tune sheets, exposed for the PDF generation script (scripts/generate-sheets.mjs). */
			bbSheetIndex?: Array<{ name: string; slug: string; displayName: string }>;
		}
	}
</script>

<script setup lang="ts">
	import config from "../../config";
	import { computed, ref, watchEffect } from "vue";
	import { getSortedTuneList, normalizeState } from "../../state/state";
	import { provideState } from "../../services/state";
	import { getTuneSlug } from "../../state/sheet";
	import SheetTune from "./sheet-tune.vue";
	import SheetLegend from "./sheet-legend.vue";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const props = defineProps<{
		tuneName?: string;
	}>();

	const i18n = useI18n();

	const state = ref(normalizeState());
	provideState(state);

	const allTuneNames = computed(() => getSortedTuneList(state.value));

	const tune = computed(() => props.tuneName != null ? state.value.tunes[props.tuneName] : undefined);

	watchEffect(() => {
		window.bbSheetIndex = allTuneNames.value.map((name) => ({
			name,
			slug: getTuneSlug(name, state.value.tunes[name]),
			displayName: getLocalizedDisplayName(state.value.tunes[name].displayName || name)
		}));
	});
</script>

<template>
	<div class="bb-sheet" :class="{ 'bb-sheet-single': tuneName != null, 'bb-sheet-booklet': tuneName == null }" v-bind="{ 'data-tune-name': tuneName ?? '' }">
		<template v-if="tuneName != null">
			<SheetTune v-if="tune" :tuneName="tuneName" :tune="tune" />
			<p v-else>{{i18n.t("sheet.tune-not-found")}}</p>
		</template>

		<template v-else>
			<div class="bb-sheet-cover">
				<h1>{{config.appName}}</h1>
				<h2>{{i18n.t("sheet.booklet-title")}}</h2>
				<p>{{i18n.t("sheet.generated", { appName: config.appName })}}</p>
				<SheetLegend :tunes="allTuneNames.map((name) => state.tunes[name])" />
			</div>

			<SheetTune
				v-for="name in allTuneNames"
				:key="name"
				:tuneName="name"
				:tune="state.tunes[name]"
				:showLegend="false"
			/>
		</template>
	</div>
</template>

<style lang="scss">
	@page {
		size: A4 portrait;
		margin: 15mm;
	}

	.bb-sheet {
		background: #fff;
		color: #000;
		font-family: Arial, Helvetica, sans-serif;
		padding: 10mm;
		width: 100%;
		max-width: 210mm;
		margin: 0 auto;
		overflow-y: auto;

		.bb-sheet-cover {
			h1 {
				font-size: 24pt;
				font-weight: bold;
				margin: 0;
			}

			h2 {
				font-size: 16pt;
				margin: 0 0 5mm 0;
			}

			p {
				font-size: 9pt;
				margin: 0 0 5mm 0;
			}
		}

		&.bb-sheet-booklet .bb-sheet-tune {
			break-before: page;
		}
	}

	@media print {
		.bb-overview {
			display: block;
			max-height: none;
		}

		.bb-overview > .bb-overview-content {
			display: block;
		}

		.bb-sheet {
			padding: 0;
			max-width: none;
			overflow: visible;
		}
	}
</style>
