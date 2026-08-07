<script lang="ts">
	/**
	 * Renders the notes of a single pattern as a condensed, print-friendly table: instruments that play the same
	 * thing are merged into one row, repeated bars are rendered once with a “×N” repeat marker, and long patterns
	 * are wrapped into multiple lines of bars.
	 */
	export default {};
</script>

<script setup lang="ts">
	import config from "../../config";
	import { Pattern } from "../../state/pattern";
	import { getSheetPattern, SheetRow } from "../../state/sheet";
	import { computed } from "vue";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const props = defineProps<{
		patternName: string;
		pattern: Pattern;
	}>();

	const i18n = useI18n();

	const sheet = computed(() => getSheetPattern(props.pattern));

	const barStrokes = computed(() => 4 * sheet.value.time);

	type RenderBar = {
		/** The index of the bar in the (uncondensed) pattern, determines the beat numbers shown above the bar. */
		barIdx: number;
		/** The number of beats of this bar (can be less than 4 for the last bar of a pattern of unusual length). */
		beats: number;
		/** Set to the repeat count if this bar starts a repeated segment (rendered as “3×” above the bar). */
		repeatCount?: number;
		/** Whether this bar starts a repeated segment. */
		repeatStart: boolean;
		/** Whether a repeated segment ends after this bar. */
		repeatEnd: boolean;
	};

	const renderBars = computed((): RenderBar[] => {
		const ret: RenderBar[] = [];
		for (const segment of sheet.value.segments) {
			for (let i = 0; i < segment.bars; i++) {
				const barIdx = segment.startBar + i;
				ret.push({
					barIdx,
					beats: Math.min(4, props.pattern.length - barIdx * 4),
					repeatCount: segment.repeat > 1 && i === 0 ? segment.repeat : undefined,
					repeatStart: segment.repeat > 1 && i === 0,
					repeatEnd: segment.repeat > 1 && i === segment.bars - 1
				});
			}
		}
		return ret;
	});

	/** The rendered bars, wrapped into lines so that each line fits the width of an A4 page. */
	const lines = computed((): RenderBar[][] => {
		const barsPerLine = Math.max(1, Math.floor(32 / barStrokes.value));
		const ret: RenderBar[][] = [];
		for (let i = 0; i < renderBars.value.length; i += barsPerLine) {
			ret.push(renderBars.value.slice(i, i + barsPerLine));
		}
		return ret;
	});

	const displayName = computed(() => getLocalizedDisplayName(props.pattern.displayName || props.patternName));

	const getRowLabel = (row: SheetRow): string => {
		if (row.label === "everybody") {
			return i18n.t("sheet.everybody");
		} else if (row.label === "everybody-else") {
			return i18n.t("sheet.everybody-else");
		} else {
			return row.instruments.map((instrument) => config.instruments[instrument].name()).join(", ");
		}
	};

	const getStroke = (row: SheetRow, bar: RenderBar, strokeIdx: number): string => {
		const stroke = row.strokes[sheet.value.upbeat + bar.barIdx * barStrokes.value + strokeIdx];
		return !stroke || stroke === " " ? "" : (config.strokes[stroke] ?? stroke);
	};

	const getUpbeatStroke = (row: SheetRow, strokeIdx: number): string => {
		const stroke = row.strokes[strokeIdx];
		return !stroke || stroke === " " ? "" : (config.strokes[stroke] ?? stroke);
	};

	const getStrokeClass = (bar: RenderBar, strokeIdx: number): string[] => {
		const time = sheet.value.time;
		const ret = ["stroke", `stroke-${strokeIdx % time}`];
		if (strokeIdx === 0) {
			ret.push("after-bar");
		}
		if ((strokeIdx + 1) % time === 0) {
			ret.push("before-beat");
		}
		if (strokeIdx === bar.beats * time - 1) {
			ret.push("before-bar");
		}
		if (bar.repeatStart && strokeIdx === 0) {
			ret.push("repeat-start");
		}
		if (bar.repeatEnd && strokeIdx === bar.beats * time - 1) {
			ret.push("repeat-end");
		}
		return ret;
	};

	const getBeatClass = (bar: RenderBar, beat: number): string[] => {
		const ret = ["beat", beat === 1 ? "after-bar" : "after-beat"];
		if (beat === bar.beats) {
			ret.push("before-bar");
		}
		if (bar.repeatStart && beat === 1) {
			ret.push("repeat-start");
		}
		if (bar.repeatEnd && beat === bar.beats) {
			ret.push("repeat-end");
		}
		return ret;
	};
</script>

<template>
	<div class="bb-sheet-pattern">
		<h3>
			{{displayName}}
			<span v-if="sheet.dynamics" class="bb-sheet-pattern-dynamics">({{i18n.t(`sheet.${sheet.dynamics}`)}})</span>
		</h3>

		<table v-for="(line, lineIdx) in lines" :key="lineIdx" :class="`time-${sheet.time}`">
			<thead>
				<tr v-if="line.some((bar) => bar.repeatCount != null)">
					<th class="row-label"></th>
					<td v-if="lineIdx === 0 && sheet.upbeat > 0" :colspan="sheet.upbeat"></td>
					<td v-for="bar in line" :key="bar.barIdx" :colspan="bar.beats * sheet.time" class="repeat-count">{{bar.repeatCount != null ? `${bar.repeatCount}×` : ""}}</td>
				</tr>
				<tr>
					<th class="row-label"></th>
					<td v-if="lineIdx === 0 && sheet.upbeat > 0" :colspan="sheet.upbeat" class="upbeat"></td>
					<template v-for="bar in line" :key="bar.barIdx">
						<td v-for="beat in bar.beats" :key="beat" :colspan="sheet.time" :class="getBeatClass(bar, beat)">{{bar.barIdx * 4 + beat}}</td>
					</template>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(row, rowIdx) in sheet.rows" :key="rowIdx">
					<th class="row-label">{{getRowLabel(row)}}</th>
					<template v-if="lineIdx === 0 && sheet.upbeat > 0">
						<td
							v-for="strokeIdx in sheet.upbeat"
							:key="strokeIdx"
							class="stroke"
							:class="{ 'after-bar': strokeIdx === 1, 'before-bar': strokeIdx === sheet.upbeat }"
						>{{getUpbeatStroke(row, strokeIdx - 1)}}</td>
					</template>
					<template v-for="bar in line" :key="bar.barIdx">
						<td
							v-for="strokeIdx in bar.beats * sheet.time"
							:key="strokeIdx"
							:class="getStrokeClass(bar, strokeIdx - 1)"
						>{{getStroke(row, bar, strokeIdx - 1)}}</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss">
	.bb-sheet-pattern {
		break-inside: avoid;
		margin-bottom: 4mm;

		h3 {
			font-size: 11pt;
			font-weight: bold;
			margin: 0 0 1mm 0;

			.bb-sheet-pattern-dynamics {
				font-weight: normal;
				font-style: italic;
				font-size: 9pt;
			}
		}

		table {
			border-collapse: collapse;
			margin-bottom: 1.5mm;
		}

		th.row-label {
			width: 30mm;
			min-width: 30mm;
			text-align: left;
			vertical-align: middle;
			font-weight: normal;
			font-size: 9pt;
			padding-right: 2mm;
		}

		thead {
			td {
				font-size: 8pt;
				vertical-align: bottom;
			}

			td.beat {
				text-align: left;
				padding-left: 1mm;

				&.after-beat {
					border-left: 0.75pt solid #666;
				}

				&.after-bar {
					border-left: 1.5pt solid #000;
				}

				&.before-bar {
					border-right: 1.5pt solid #000;
				}

				&.repeat-start {
					border-left: 3px double #000;
				}

				&.repeat-end {
					border-right: 3px double #000;
				}
			}

			td.repeat-count {
				font-size: 8pt;
				font-weight: bold;
				text-align: left;
				padding-left: 1mm;
			}
		}

		td.stroke {
			text-align: center;
			font-size: 9pt;
			height: 5.5mm;
			vertical-align: middle;
			border-right: 0.5pt solid #ccc;

			&.before-beat {
				border-right: 0.75pt solid #666;
			}

			&.before-bar {
				border-right: 1.5pt solid #000;
			}

			&.after-bar {
				border-left: 1.5pt solid #000;
			}

			&.repeat-start {
				border-left: 3px double #000;
			}

			&.repeat-end {
				border-right: 3px double #000;
			}
		}

		table.time-2 td.stroke {
			width: 9mm;
		}

		table.time-3 td.stroke {
			width: 6mm;
		}

		table.time-4 td.stroke {
			width: 4.6mm;
		}

		table.time-6 td.stroke {
			width: 6mm;
		}

		table.time-12 td.stroke,
		table.time-20 td.stroke {
			width: 3mm;
			font-size: 7pt;
		}

		table.time-12 td.stroke:not(.before-beat, .before-bar, .stroke-2, .stroke-5, .stroke-8),
		table.time-20 td.stroke:not(.before-beat, .before-bar, .stroke-4, .stroke-9, .stroke-14) {
			border-right: none;
		}
	}
</style>
