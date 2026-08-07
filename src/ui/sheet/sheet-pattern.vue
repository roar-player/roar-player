<script lang="ts">
	/**
	 * Renders the notes of a single pattern as a condensed, print-friendly table: instruments that play the same
	 * thing are merged into one row, repeated bars are rendered once with a repeat count (“3×” above the first
	 * repeated bar), and long patterns are wrapped into multiple lines of bars.
	 *
	 * The table layout follows the pattern player: every beat has the same width independent of the subdivision,
	 * overflowing stroke texts (e.g. shouts) stay visible, and beats that contain triplet strokes are colored and
	 * get their subdivision dividers at thirds instead of quarters.
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

	/** How many bars are rendered per line. With a uniform beat width, two bars always fit an A4 page. */
	const BARS_PER_LINE = 2;

	type RenderBar = {
		/** The index of the bar in the (uncondensed) pattern, determines the beat numbers shown above the bar. */
		barIdx: number;
		/** The number of beats of this bar (can be less than 4 for the last bar of a pattern of unusual length). */
		beats: number;
		/** The index of the segment that this bar belongs to. */
		segmentIdx: number;
		/** Whether this bar is part of a repeated segment (highlighted with a grey background). */
		inRepeat: boolean;
		/** Set to the repeat count if this bar starts a repeated segment (rendered as “3×” above the bar). */
		repeatCount?: number;
	};

	const renderBars = computed((): RenderBar[] => {
		const ret: RenderBar[] = [];
		sheet.value.segments.forEach((segment, segmentIdx) => {
			for (let i = 0; i < segment.bars; i++) {
				const barIdx = segment.startBar + i;
				ret.push({
					barIdx,
					beats: Math.min(4, props.pattern.length - barIdx * 4),
					segmentIdx,
					inRepeat: segment.repeat > 1,
					repeatCount: segment.repeat > 1 && i === 0 ? segment.repeat : undefined
				});
			}
		});
		return ret;
	});

	/**
	 * The cells of the repeat indicator row above the beat numbers: one cell per segment (per line), so that the
	 * grey background of a repeated block is continuous across its bars but interrupted between adjacent blocks.
	 */
	const getRepeatCells = (line: RenderBar[]) => {
		const groups: Array<{ bars: RenderBar[] }> = [];
		for (const bar of line) {
			const last = groups[groups.length - 1];
			if (last && last.bars[0].segmentIdx === bar.segmentIdx) {
				last.bars.push(bar);
			} else {
				groups.push({ bars: [bar] });
			}
		}
		return groups.map((group) => ({
			colspan: group.bars.reduce((sum, bar) => sum + bar.beats * sheet.value.time, 0),
			label: group.bars[0].repeatCount != null ? `${group.bars[0].repeatCount}×` : "",
			inRepeat: group.bars[0].inRepeat
		}));
	};

	/** The rendered bars, wrapped into lines so that each line fits the width of an A4 page. */
	const lines = computed((): RenderBar[][] => {
		const ret: RenderBar[][] = [];
		for (let i = 0; i < renderBars.value.length; i += BARS_PER_LINE) {
			ret.push(renderBars.value.slice(i, i + BARS_PER_LINE));
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

	const hasNote = (row: SheetRow, strokeIdx: number): boolean => {
		const stroke = row.strokes[strokeIdx];
		return stroke != null && stroke !== " ";
	};

	/**
	 * For each row, whether each beat of the pattern body contains triplet strokes (strokes that are not on the
	 * quarter grid of the beat). Only computed for the time signatures that can mix both grids (12 and 24).
	 */
	const tripletBeats = computed((): boolean[][] | undefined => {
		const time = sheet.value.time;
		if (time !== 12 && time !== 24) {
			return undefined;
		}
		return sheet.value.rows.map((row) => {
			const beats: boolean[] = [];
			for (let beat = 0; beat * time < row.strokes.length - sheet.value.upbeat; beat++) {
				let ternary = false;
				for (let k = 0; k < time && !ternary; k++) {
					ternary = k % 3 !== 0 && hasNote(row, sheet.value.upbeat + beat * time + k);
				}
				beats.push(ternary);
			}
			return beats;
		});
	});

	/** Like tripletBeats, but for the (partial) beat formed by the upbeat strokes. */
	const tripletUpbeat = computed((): boolean[] | undefined => {
		const time = sheet.value.time;
		if ((time !== 12 && time !== 24) || sheet.value.upbeat === 0) {
			return undefined;
		}
		return sheet.value.rows.map((row) => {
			for (let i = 0; i < sheet.value.upbeat; i++) {
				// The upbeat is aligned to the end of its beat, and time is divisible by 3, so the position of the
				// stroke within the triplet grid is ((i - upbeat) % 3 + 3) % 3.
				if (((i - sheet.value.upbeat) % 3 + 3) % 3 !== 0 && hasNote(row, i)) {
					return true;
				}
			}
			return false;
		});
	});

	const getStroke = (row: SheetRow, bar: RenderBar, strokeIdx: number): string => {
		const stroke = row.strokes[sheet.value.upbeat + bar.barIdx * barStrokes.value + strokeIdx];
		return !stroke || stroke === " " ? "" : (config.strokes[stroke] ?? stroke);
	};

	const getUpbeatStroke = (row: SheetRow, strokeIdx: number): string => {
		const stroke = row.strokes[strokeIdx];
		return !stroke || stroke === " " ? "" : (config.strokes[stroke] ?? stroke);
	};

	const getStrokeClass = (rowIdx: number, bar: RenderBar, strokeIdx: number): string[] => {
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
		if (bar.inRepeat) {
			ret.push("repeat");
		}
		if (tripletBeats.value?.[rowIdx][bar.barIdx * 4 + Math.floor(strokeIdx / time)]) {
			ret.push("is-triplet");
		}
		return ret;
	};

	const getUpbeatStrokeClass = (rowIdx: number, strokeIdx: number): string[] => {
		const time = sheet.value.time;
		// The upbeat is aligned to the end of its beat, so its strokes get the positions at the end of the beat
		// (which gives them the same subdivision dividers as the regular beats)
		const position = (((strokeIdx - sheet.value.upbeat) % time) + time) % time;
		const ret = ["stroke", `stroke-${position}`];
		if (strokeIdx === 0) {
			ret.push("after-bar");
		}
		if (position === time - 1) {
			ret.push("before-beat");
		}
		if (strokeIdx === sheet.value.upbeat - 1) {
			ret.push("before-bar");
		}
		if (tripletUpbeat.value?.[rowIdx]) {
			ret.push("is-triplet");
		}
		return ret;
	};

	const getBeatClass = (bar: RenderBar, beat: number): string[] => {
		const ret = ["beat", beat === 1 ? "after-bar" : "after-beat"];
		if (beat === bar.beats) {
			ret.push("before-bar");
		}
		if (bar.inRepeat) {
			ret.push("repeat");
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

		<table v-for="(line, lineIdx) in lines" :key="lineIdx" :class="`time-${sheet.time}`" translate="no">
			<thead>
				<tr v-if="line.some((bar) => bar.inRepeat)">
					<th class="row-label"></th>
					<td v-if="lineIdx === 0 && sheet.upbeat > 0" :colspan="sheet.upbeat"></td>
					<td v-for="(cell, cellIdx) in getRepeatCells(line)" :key="cellIdx" :colspan="cell.colspan" class="repeat-count" :class="{ repeat: cell.inRepeat }">{{cell.label}}</td>
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
				<tr v-for="(row, rowIdx) in sheet.rows" :key="rowIdx" :class="{ vocals: row.instruments.includes('ot') }">
					<th class="row-label">{{getRowLabel(row)}}</th>
					<template v-if="lineIdx === 0 && sheet.upbeat > 0">
						<td
							v-for="strokeIdx in sheet.upbeat"
							:key="strokeIdx"
							:class="getUpbeatStrokeClass(rowIdx, strokeIdx - 1)"
						><span class="stroke-inner">{{getUpbeatStroke(row, strokeIdx - 1)}}</span></td>
					</template>
					<template v-for="bar in line" :key="bar.barIdx">
						<td
							v-for="strokeIdx in bar.beats * sheet.time"
							:key="strokeIdx"
							:class="getStrokeClass(rowIdx, bar, strokeIdx - 1)"
						><span class="stroke-inner">{{getStroke(row, bar, strokeIdx - 1)}}</span></td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss">
	.bb-sheet-pattern {
		$beat-width: 18mm;

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

				// The white gaps make clear where one repeated block ends and the next one starts
				&.repeat {
					background-color: #ececec;
					border-left: 1mm solid #fff;
					border-right: 1mm solid #fff;
				}
			}

			td.beat.repeat {
				background-color: #ececec;
			}
		}

		$stroke-height: 5.5mm;

		td.stroke {
			text-align: center;
			font-size: 9pt;
			height: $stroke-height;
			vertical-align: middle;
			padding: 0;
			overflow: visible;

			.stroke-inner {
				// A block of the full cell height, so that the background of overflowing texts covers the whole cell
				display: block;
				width: max-content;
				margin: 0 auto;
				white-space: nowrap;
				height: $stroke-height;
				line-height: $stroke-height;
			}

			&.is-triplet .stroke-inner {
				color: #d63384;
			}

			&.before-beat {
				border-right: 0.75pt solid #666;
			}

			&.before-bar {
				border-right: 1.5pt solid #000;
			}

			&.after-bar {
				border-left: 1.5pt solid #000;
			}

			&.repeat {
				background-color: #ececec;
			}
		}

		// Shouting texts overflow their (narrow) cells; the background hides the table lines behind them.
		// position/z-index lift the text above the borders of the following cells, which would otherwise be
		// painted on top of the overflowing part.
		tr.vocals .stroke-inner:not(:empty) {
			position: relative;
			z-index: 1;
			background-color: #fff;
			padding: 0 0.3mm;
		}

		tr.vocals td.stroke.repeat .stroke-inner:not(:empty) {
			background-color: #ececec;
		}

		// Every beat has the same width, independent of the subdivision. The subdivision dividers are drawn at the
		// quarters of the beat (the same positions as in the pattern player).
		$subdivisions: (
			2: (0,),
			3: (0, 1),
			4: (0, 1, 2),
			5: (0, 1, 2, 3),
			6: (1, 3),
			8: (1, 3, 5),
			9: (2, 5),
			12: (2, 5, 8),
			16: (3, 7, 11),
			20: (4, 9, 14),
			24: (5, 11, 17)
		);

		@each $time, $dividers in $subdivisions {
			table.time-#{$time} {
				td.stroke {
					max-width: calc(#{$beat-width} / #{$time});
				}

				.stroke-inner {
					min-width: calc(#{$beat-width} / #{$time});
				}

				@each $i in $dividers {
					td.stroke.stroke-#{$i}:not(.is-triplet) {
						border-right: 0.5pt solid #bbb;
					}
				}
			}
		}

		// Beats that contain triplet strokes get their dividers at the thirds of the beat instead
		table.time-12 td.stroke.is-triplet {
			&.stroke-3, &.stroke-7 {
				border-right: 0.5pt solid #bbb;
			}
		}

		table.time-24 td.stroke.is-triplet {
			&.stroke-7, &.stroke-15 {
				border-right: 0.5pt solid #bbb;
			}
		}
	}
</style>
