<script lang="ts">
	/**
	 * Renders the notes of a pattern as a table, with a toolbar that allows to play the notes and various other actions,
	 * and the notes being editable (unless opened in read-only mode).
	 *
	 * Like the printable tune sheets (see src/state/condensed.ts), the table shows the volume annotations of the pattern
	 * (crescendos and soft/loud sections specified through the volume hack) above the beat numbers, and offers a
	 * condensed view (the default in read-only mode) in which repeated bars are rendered only once with a repeat
	 * count (“4×”, or “N×” for open-ended repeats). During playback, the repeat count shows the current iteration
	 * (“2/4×”). In edit mode, changing a stroke inside a repeated block applies it to all repetitions, and the
	 * repeat count can be increased/decreased, which appends/removes copies of the repeated bars.
	 */
	export default {};
</script>

<script setup lang="ts">
	import config, { Instrument } from "../../config";
	import { BeatboxReference, createBeatbox, patternToBeatbox, rawPatternPlaybackSettings } from "../../services/player";
	import { patternEquals, PatternSegment, setSegmentRepeatCount, updateStrokeMirrored } from "../../state/pattern";
	import { CondensedTempoMark, getCondensedPattern } from "../../state/condensed";
	import { getAnnotationText, getTempoMarkGlyph, getTempoMarkTooltip } from "../utils/condensed-annotations";
	import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
	import { createPattern, getPatternFromState } from "../../state/state";
	import { clone } from "../../utils";
	import defaultTunes from "../../defaultTunes";
	import { isEqual } from "lodash-es";
	import StrokeDropdown from "./stroke-dropdown.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, nextTick, ref, watch } from "vue";
	import { showConfirm } from "../utils/alert";
	import vTooltip from "../utils/tooltip";
	import { CustomPopover } from "../utils/popover.vue";
	import PatternPlayerToolbar from "./pattern-player-toolbar.vue";
	import MuteButton from "../playback-settings/mute-button.vue";
	import HeadphonesButton from "../playback-settings/headphones-button.vue";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";
	import type { FollowPlaybackContext } from "../../services/utils";
	import { useI18n } from "../../services/i18n";

	type StrokeDropdownInfo = {
		instr: Instrument,
		i: number,
		sequence?: string
	};

	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		player?: BeatboxReference;
		tuneName: string;
		patternName: string;
		readonly?: boolean;
	}>(), {
		readonly: false
	});

	const i18n = useI18n();

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);

	const playerRef = ref<BeatboxReference>(props.player || createBeatbox(true));
	const playbackSettings = ref<PlaybackSettings>({
		...normalizePlaybackSettings(state.value.playbackSettings),
		speed: pattern.value.speed,
		loop: pattern.value.loop
	});
	const currentStrokeDropdown = ref<StrokeDropdownInfo>();

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const upbeatBeats = computed(() => Math.ceil(pattern.value.upbeat / pattern.value.time));

	const containerRef = ref<HTMLElement>();
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	/** Whether repeated bars are rendered only once with a repeat count (like on the printed tune sheets). */
	const condensed = ref(props.readonly);

	const condensedPattern = computed(() => getCondensedPattern(pattern.value));
	// The uncondensed representation still carries the volume annotations, which are shown in both views
	const renderedPattern = computed(() => condensed.value ? condensedPattern.value : getCondensedPattern(pattern.value, { condense: false }));

	/** Whether the condensed view differs from the full view, i.e. any repeated/open blocks were detected. */
	const hasCondensedView = computed(() => condensedPattern.value.segments.some((segment) => segment.repeat > 1 || segment.open));

	const barStrokes = computed(() => 4 * pattern.value.time);

	type RenderBar = {
		/** The index of the bar in the (uncondensed) pattern, determines the beat numbers shown above the bar. */
		barIdx: number;
		/** The number of beats of this bar (can be less than 4 for the last bar of a pattern of unusual length). */
		beats: number;
		/** The index of the segment that this bar belongs to. */
		segmentIdx: number;
		/** Whether this bar is part of a repeated block (highlighted with a grey background). */
		inRepeat: boolean;
	};

	const renderBars = computed((): RenderBar[] => {
		const ret: RenderBar[] = [];
		renderedPattern.value.segments.forEach((segment, segmentIdx) => {
			for (let i = 0; i < segment.bars; i++) {
				const barIdx = segment.startBar + i;
				ret.push({
					barIdx,
					beats: Math.min(4, pattern.value.length - barIdx * 4),
					segmentIdx,
					inRepeat: segment.repeat > 1 || !!segment.open
				});
			}
		});
		return ret;
	});

	type RenderStroke = {
		/** The raw index of the stroke in the stroke arrays (index 0 is the first upbeat stroke). */
		i: number;
		inRepeat: boolean;
	};

	/** The strokes rendered as cells, in order: the upbeat strokes, then the strokes of the rendered bars. */
	const renderedStrokes = computed((): RenderStroke[] => {
		const ret: RenderStroke[] = [];
		for (let i = 0; i < pattern.value.upbeat; i++) {
			ret.push({ i, inRepeat: false });
		}
		for (const bar of renderBars.value) {
			for (let k = 0; k < bar.beats * pattern.value.time; k++) {
				ret.push({ i: pattern.value.upbeat + bar.barIdx * barStrokes.value + k, inRepeat: bar.inRepeat });
			}
		}
		return ret;
	});

	/** The cells of the indicator row above the beat numbers: one per segment, carrying repeat count and/or volume annotation. */
	const indicatorCells = computed(() => renderedPattern.value.segments.map((segment, segmentIdx) => {
		const isRepeat = segment.repeat > 1 || !!segment.open;
		const annotationText = getAnnotationText(segment);
		return {
			segmentIdx,
			segment,
			colspan: renderBars.value.filter((bar) => bar.segmentIdx === segmentIdx).reduce((sum, bar) => sum + bar.beats * pattern.value.time, 0),
			isRepeat,
			label: isRepeat ? `${segment.open ? "N" : segment.repeat}×` : "",
			// Next to a repeat count the annotation is separated from it by a space
			annotationText: annotationText && (isRepeat ? ` ${annotationText}` : annotationText),
			hasIndicator: isRepeat || segment.dynamics != null || segment.volume != null
		};
	}));

	const hasIndicatorRow = computed(() => indicatorCells.value.some((cell) => cell.hasIndicator));

	/** The tempo marks (♩+/♩− at bar lines, through the speed hack) by the bar they are rendered at. */
	const tempoMarksByBar = computed(() => {
		const ret = new Map<number, CondensedTempoMark[]>();
		for (const mark of renderedPattern.value.tempoMarks) {
			const existing = ret.get(mark.bar);
			if (existing) {
				existing.push(mark);
			} else {
				ret.set(mark.bar, [mark]);
			}
		}
		return ret;
	});

	const hasTempoRow = computed(() => tempoMarksByBar.value.size > 0);

	/** While playing inside a repeated block, the block and the iteration (0-based) the position is in. */
	const playbackIteration = ref<{ segmentIdx: number; iteration: number }>();

	/** The label of an indicator cell, showing the current iteration (“2/4×”) while playing inside the block. */
	const getIndicatorLabel = (cell: typeof indicatorCells.value[number]): string => {
		if (cell.isRepeat && playbackIteration.value?.segmentIdx === cell.segmentIdx) {
			return `${playbackIteration.value.iteration + 1}/${cell.segment.open ? "N" : cell.segment.repeat}×`;
		}
		return cell.label;
	};

	/**
	 * Maps a playback beat (0 = first regular beat, can be fractional) to its location in the rendered view:
	 * in the condensed view, beats inside later iterations of a repeated block are mapped back onto the
	 * canonical (rendered) bars of the block, and the iteration is reported for the repeat counter.
	 */
	const getBeatLocation = (beat: number): { beat: number; segmentIdx?: number; iteration?: number } => {
		if (beat >= 0 && condensed.value) {
			const bar = Math.floor(beat / 4);
			const segmentIdx = renderedPattern.value.segments.findIndex((segment) => bar >= segment.startBar && bar < segment.startBar + segment.bars * segment.repeat);
			const segment = renderedPattern.value.segments[segmentIdx];
			if (segment && (segment.repeat > 1 || segment.open)) {
				const iteration = Math.floor((bar - segment.startBar) / segment.bars);
				const canonicalBar = segment.startBar + (bar - segment.startBar) % segment.bars;
				return { beat: beat + (canonicalBar - bar) * 4, segmentIdx, iteration };
			}
		}
		return { beat };
	};

	/** The repeated segment that contains the given raw stroke index, used to mirror edits into all iterations. */
	const getSegmentAtStroke = (i: number): PatternSegment | undefined => {
		const bodyIndex = i - pattern.value.upbeat;
		if (bodyIndex < 0) {
			return undefined;
		}
		const bar = Math.floor(bodyIndex / barStrokes.value);
		return renderedPattern.value.segments.find((segment) => bar >= segment.startBar && bar < segment.startBar + segment.bars * segment.repeat);
	};

	/** Appends/removes one copy of the repeated bars of the given segment. */
	const changeRepeatCount = (segmentIdx: number, delta: number) => {
		const segment = renderedPattern.value.segments[segmentIdx];
		setSegmentRepeatCount(pattern.value, segment, segment.repeat + delta);
	};

	watch([
		() => playbackSettings.value.volume,
		() => playbackSettings.value.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			updatePlaybackSettings(state.value.playbackSettings, {
				volume: playbackSettings.value.volume,
				volumes: playbackSettings.value.volumes
			});
		}
	}, { deep: true });

	watch([
		() => state.value.playbackSettings.volume,
		() => state.value.playbackSettings.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			playbackSettings.value.volume = state.value.playbackSettings.volume;
			playbackSettings.value.volumes = clone(state.value.playbackSettings.volumes);
		}
	}, { deep: true });

	const rawPatternSettings = rawPatternPlaybackSettings(() => playbackSettings.value);

	const rawPattern = computed(() => patternToBeatbox(pattern.value, rawPatternSettings.value));

	/** The index of the beat cell currently highlighted as active, so that the highlight (and the DOM queries
	 * involved) is only touched when the beat changes, not on every frame of the playback position updates. */
	let activeBeatIdx: number | undefined;

	const handlePosition = ({ beat }: PositionData) => {
		const location = beat != null ? getBeatLocation(beat) : undefined;
		const iteration = location?.segmentIdx != null ? { segmentIdx: location.segmentIdx, iteration: location.iteration! } : undefined;
		if (!isEqual(iteration, playbackIteration.value)) {
			// Only touch the ref when the values change: a new object on every frame would re-render the
			// indicator row at frame rate
			playbackIteration.value = iteration;
		}
		const beatIdx = location != null ? Math.floor(location.beat) : undefined;
		if (beatIdx === activeBeatIdx) {
			return;
		}
		activeBeatIdx = beatIdx;
		const activeBeat = containerRef.value!.querySelector(".beat.active");
		const beatEl = beatIdx != null ? containerRef.value!.querySelector(`.beat-i-${beatIdx}`) : null;
		if (activeBeat && activeBeat !== beatEl) {
			activeBeat.classList.remove("active");
		}
		if (beatEl && beatEl !== activeBeat) {
			beatEl.classList.add("active");
		}
	};

	/** Cache of the rendered stroke cells by stroke index, so that following the playback position does not
	 * run a DOM query on every frame. Entries are validated before use, so re-renders need no invalidation. */
	const strokeElCache = new Map<number, HTMLElement>();

	const getStrokeEl = (strokeIdx: number): HTMLElement | undefined => {
		let strokeEl = strokeElCache.get(strokeIdx);
		if (!strokeEl?.isConnected || !strokeEl.classList.contains(`stroke-i-${strokeIdx}`)) {
			strokeEl = containerRef.value!.querySelector<HTMLElement>(".stroke-i-"+strokeIdx) ?? undefined;
			if (strokeEl) {
				strokeElCache.set(strokeIdx, strokeEl);
			}
		}
		return strokeEl;
	};

	const getPositionMarkerLeft = ({ beat }: PositionData<false>) => {
		const stroke = getBeatLocation(beat).beat * pattern.value.time;
		// At the very end of the pattern, the position points one past the last stroke — clamp to the last cell
		const strokeIdx = Math.min(Math.floor(stroke), pattern.value.length * pattern.value.time - 1);
		const strokeEl = getStrokeEl(strokeIdx);
		return strokeEl ? (strokeEl.offsetLeft + strokeEl.offsetWidth * (stroke - strokeIdx)) : 0;
	};

	/** The playback context for the scrolling that follows the position marker: the read-ahead ensures the next
	 * 3 beats stay visible, and while a repeated block is playing, its pixel range lets the scrolling keep the
	 * whole block in view (when it fits) or avoid a page turn right before jumping back to the block start. */
	const getScrollContext = ({ beat }: PositionData<false>) => {
		const location = getBeatLocation(beat);
		const strokeIdx = Math.min(Math.max(0, Math.floor(location.beat * pattern.value.time)), pattern.value.length * pattern.value.time - 1);
		const strokeWidth = getStrokeEl(strokeIdx)?.offsetWidth ?? 0;
		const context: FollowPlaybackContext = { aheadWidth: 3 * pattern.value.time * strokeWidth };
		if (condensed.value && location.segmentIdx != null) {
			const segment = renderedPattern.value.segments[location.segmentIdx];
			const startEl = getStrokeEl(segment.startBar * barStrokes.value);
			const endStroke = (segment.startBar + segment.bars) * barStrokes.value;
			// For a block at the end of the pattern, there is no cell after it — use the last cell's right edge
			const afterEl = getStrokeEl(endStroke);
			const lastEl = afterEl ?? getStrokeEl(endStroke - 1);
			if (startEl && lastEl) {
				context.block = {
					start: startEl.offsetLeft,
					end: afterEl ? afterEl.offsetLeft : lastEl.offsetLeft + lastEl.offsetWidth,
					final: location.iteration != null && location.iteration >= segment.repeat - 1
				};
			}
		}
		return context;
	};


	// If there is no upbeat, beatI goes from 0 to length - 1.
	// If there is an upbeat, beatI goes from floor(-upbeat/time) to length - 1.
	const isTernaryBeat = (instrumentKey: Instrument, beatI: number) => {
		const patternForInstrument = pattern.value[instrumentKey];
		const hasNote = (j: number) => {
			// pattern is an array so its indexes start at 0, not -upbeat.
			const realJ = j + pattern.value.upbeat;
			return patternForInstrument[realJ] !== undefined && patternForInstrument[realJ] !== null && patternForInstrument[realJ] !== " ";
		}
		const firstStrokeInBeat = beatI * pattern.value.time;
		const lastStrokeInBeat = firstStrokeInBeat + pattern.value.time - 1;
		for (let strokeNum = firstStrokeInBeat; strokeNum <= lastStrokeInBeat; strokeNum++) {
			if (strokeNum%3 !==0 && hasNote(strokeNum)) {
				return true;
			}
		}
		return false;
	}
	const beatIFromStrokeI = (strokeI: number) => {
		return Math.floor(strokeI/pattern.value.time);
	}
	// For each instrument, for each stroke, return the CSS class to apply to the stroke : "" or "is-triplet".
	const ternaryCSSClasses = computed(() => {
		const ret = {} as Record<Instrument, Record<number, string>>;
		for (let instrumentKey of config.instrumentKeys) {
			ret[instrumentKey] = {};
		}
		// We only support 12 and 24 time signatures for now.
		if(![12, "12", 24, "24"].includes(pattern.value.time)) return ret;
		const ternaryClassesForInstrument = (instrumentKey: Instrument) => {
			const areBeatsTernary: Record<number, boolean> = {};
			for (let beatI = beatIFromStrokeI(-pattern.value.upbeat); beatI < pattern.value.length; beatI++) {
				areBeatsTernary[beatI] = isTernaryBeat(instrumentKey, beatI);
			}
			const ternaryCSSClassesForInstrument: Record<number, string> = {};
			for (let strokeI = -pattern.value.upbeat; strokeI < pattern.value.length*pattern.value.time + pattern.value.upbeat; strokeI++) {
				ternaryCSSClassesForInstrument[strokeI] = areBeatsTernary[beatIFromStrokeI(strokeI)] ? 'is-triplet' : '';
			}
			return ternaryCSSClassesForInstrument;
		}
		for (let instrumentKey of config.instrumentKeys) {
			ret[instrumentKey] = ternaryClassesForInstrument(instrumentKey);
		}
		return ret;
	});

	const getBeatClass = (i: number) => {
		let positiveI = i;
		while(positiveI < 0) // Support negative numbers properly
			positiveI += 4;

		const ret = [ "beat-"+(positiveI%4), "beat-i-"+i ];
		// The last beat of the pattern ends with a bar line even if the last bar has less than 4 beats
		if(positiveI%4 == 3 || i == pattern.value.length - 1)
			ret.push("before-bar");
		if(positiveI%4 == 0)
			ret.push("after-bar");
		return ret;
	};

	const getStrokeClass = (realI: number, instrumentKey: Instrument) => {
		// realI starts at 0, even if there is an upbeat.
		// i goes from -upbeat to length*time - 1.
		let i = realI - pattern.value.upbeat;

		const ret = [
			"stroke-"+(i%pattern.value.time),
			"stroke-i-"+i
		];
		if((i+1)%pattern.value.time == 0)
			ret.push("before-beat");
		if(i%pattern.value.time == 0)
			ret.push("after-beat");
		// The last stroke of the pattern ends with a bar line even if the last bar has less than 4 beats
		if((i+1)%(pattern.value.time*4) == 0 || i == pattern.value.length * pattern.value.time - 1)
			ret.push("before-bar");
		if(i%(pattern.value.time*4) == 0)
			ret.push("after-bar");

		if(originalPattern.value) {
			// Map the position onto the grid of the original pattern (anchored at the first regular beat, like
			// updatePattern() does), so that changing the upbeat or subdivisions does not mark musically
			// unchanged strokes as changed. Positions that do not exist on the original grid compare as empty.
			const origI = originalPattern.value.upbeat + i * originalPattern.value.time / pattern.value.time;
			const origStroke = (Number.isInteger(origI) && originalPattern.value[instrumentKey][origI]) || "";
			if(origStroke.trim() != (pattern.value[instrumentKey][realI] || "").trim())
				ret.push("has-changes");
		}

		return ret;
	};

	const setPosition = (event: MouseEvent) => {
		let tr = event.target instanceof HTMLElement ? event.target.closest("tr") : undefined;
		let firstBeat = tr?.querySelector("td.beat");

		if (tr && firstBeat) {
			const trRect = tr.getBoundingClientRect();
			const beatRect = firstBeat.getBoundingClientRect();
			const fraction = (event.clientX - beatRect.left) / (tr.offsetWidth - beatRect.left + trRect.left);
			// Map the click onto the rendered strokes, so that in the condensed view a click inside a repeated
			// block seeks to its first iteration
			const strokes = renderedStrokes.value;
			const stroke = strokes[Math.max(0, Math.min(strokes.length - 1, Math.floor(fraction * strokes.length)))];
			// Seek by beat, so that the tempo changes of the pattern (through the speed hack) are taken into account
			abstractPlayerRef.value!.setBeat((stroke.i - pattern.value.upbeat) / pattern.value.time);
		}
	};

	const hasLocalChanges = computed(() => originalPattern.value && !patternEquals(originalPattern.value, pattern.value));

	const reset = async () => {
		if(await showConfirm({
			title: () => i18n.t("pattern-player.restore-title"),
			message: () => i18n.t("pattern-player.restore-message"),
			variant: "warning",
			okLabel: () => i18n.t("pattern-player.restore-ok")
		}))
			createPattern(state.value, props.tuneName, props.patternName, originalPattern.value || undefined);
	};

	const clickStroke = (instrumentKey: Instrument, i: number) => {
		if(isEqual(currentStrokeDropdown.value, { instr: instrumentKey, i }))
			closeStrokeDropdown();
		else {
			openStrokeDropdown({ instr: instrumentKey, i });
		}
	};

	const onStrokeChange = (newStroke: string, prev: boolean) => {
		if(currentStrokeDropdown.value && (!prev || currentStrokeDropdown.value.i > 0)) {
			const i = currentStrokeDropdown.value.i - (prev ? 1 : 0);
			// In the condensed view, an edit inside a repeated block applies to all its iterations
			updateStrokeMirrored(pattern.value, currentStrokeDropdown.value.instr, i, newStroke, condensed.value ? getSegmentAtStroke(i) : undefined);
		}
	};

	const onStrokePrevNext = (previous: boolean = false) => {
		if(!currentStrokeDropdown.value)
			return;

		// Navigate through the rendered strokes, which in the condensed view skips the hidden repetitions
		const strokes = renderedStrokes.value;
		const idx = strokes.findIndex((stroke) => stroke.i === currentStrokeDropdown.value!.i);
		const newIdx = idx + (previous ? -1 : 1);
		if(idx === -1 || newIdx < 0 || newIdx >= strokes.length)
			return currentStrokeDropdown.value = undefined;

		openStrokeDropdown({
			instr: currentStrokeDropdown.value.instr,
			i: strokes[newIdx].i
		});
	};

	const strokeDropdownRef = ref<HTMLElement>();
	const strokeDropdownPopover = ref<CustomPopover>();

	const openStrokeDropdown = (info: StrokeDropdownInfo) => {
		currentStrokeDropdown.value = info;
	};

	const closeStrokeDropdown = () => {
		currentStrokeDropdown.value = undefined;
	};

	watch(condensed, closeStrokeDropdown);

	watch(currentStrokeDropdown, () => {
		if (strokeDropdownPopover.value) {
			strokeDropdownPopover.value.dispose();
			strokeDropdownPopover.value = undefined;
		}

		void nextTick(() => {
			if (currentStrokeDropdown.value) {
				strokeDropdownPopover.value = new CustomPopover(`#bb-pattern-player-stroke-${currentStrokeDropdown.value.instr}-${currentStrokeDropdown.value.i}`, { content: strokeDropdownRef.value!, placement: 'bottom' });
				strokeDropdownPopover.value.show();
			}
		});
	}, { immediate: true });
</script>

<template>
	<div>
		<PatternPlayerToolbar
			:tuneName="tuneName"
			:patternName="patternName"
			:player="playerRef"
			v-model:playbackSettings="playbackSettings"
			:readonly="readonly"
		>
			<template #settings>
				<button
					v-if="hasCondensedView"
					type="button"
					class="btn btn-secondary bb-condensed-toggle"
					:class="{ active: condensed }"
					@click="condensed = !condensed"
					v-tooltip="i18n.t('pattern-player.condensed-tooltip')"
					:aria-label="i18n.t('pattern-player.condensed-tooltip')"
					:aria-pressed="condensed"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M120-120v-240h80v160h160v80H120Zm480 0v-80h160v-160h80v240H600ZM287-327l-57-56 57-57H80v-80h207l-57-57 57-56 153 153-153 153Zm386 0L520-480l153-153 57 56-57 57h207v80H673l57 57-57 56ZM120-600v-240h240v80H200v160h-80Zm640 0v-160H600v-80h240v240h-80Z"/></svg></button>
			</template>

			<slot />

			<button v-if="hasLocalChanges" type="button" class="btn btn-warning" @click="reset()"><fa icon="eraser"/>{{" "}}{{i18n.t("pattern-player.restore")}}</button>
		</PatternPlayerToolbar>

		<div class="bb-pattern-player-container" ref="containerRef">
			<table class="bb-pattern-player" :class="[`time-${pattern.time}`, readonly ? 'listen' : 'compose']" translate="no">
				<thead>
					<tr v-if="hasTempoRow" class="tempo-row">
						<td colspan="2"></td>
						<td v-if="pattern.upbeat > 0" :colspan="pattern.upbeat"></td>
						<td
							v-for="bar in renderBars"
							:key="bar.barIdx"
							:colspan="bar.beats * pattern.time"
							class="tempo-mark-cell"
							:class="{ 'has-mark': tempoMarksByBar.has(bar.barIdx) }"
						><span v-if="tempoMarksByBar.has(bar.barIdx)" class="tempo-mark" v-tooltip="getTempoMarkTooltip(tempoMarksByBar.get(bar.barIdx)!)">{{getTempoMarkGlyph(tempoMarksByBar.get(bar.barIdx)!)}}</span></td>
					</tr>
					<tr v-if="hasIndicatorRow" class="indicator-row">
						<td colspan="2"></td>
						<td v-if="pattern.upbeat > 0" :colspan="pattern.upbeat"></td>
						<td
							v-for="cell in indicatorCells"
							:key="cell.segmentIdx"
							:colspan="cell.colspan"
							class="repeat-count"
							:class="{ repeat: cell.isRepeat, 'repeat-start': cell.hasIndicator, 'repeat-end': cell.hasIndicator }"
							v-tooltip="!readonly && condensed && cell.isRepeat ? i18n.t('pattern-player.repeat-edit-hint') : ''"
						>{{getIndicatorLabel(cell)}}<span v-if="cell.annotationText" class="repeat-dynamics">{{cell.annotationText}}</span><span v-if="!readonly && condensed && cell.isRepeat" class="repeat-buttons">
							<button type="button" class="repeat-count-btn" :disabled="cell.segment.repeat <= 1" @click="changeRepeatCount(cell.segmentIdx, -1)" v-tooltip="i18n.t('pattern-player.repeat-remove')"><fa icon="minus"/></button>
							<button type="button" class="repeat-count-btn" @click="changeRepeatCount(cell.segmentIdx, 1)" v-tooltip="i18n.t('pattern-player.repeat-add')"><fa icon="plus"/></button>
						</span></td>
					</tr>
					<tr>
						<td colspan="2" class="instrument-operations">
							<MuteButton instrument="all" v-model:playbackSettings="playbackSettings"/>
						</td>
						<td v-for="i in upbeatBeats" :key="i" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i-1 - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
						<template v-for="bar in renderBars" :key="bar.barIdx">
							<td v-for="beat in bar.beats" :key="beat" :colspan="pattern.time" class="beat" :class="[...getBeatClass(bar.barIdx * 4 + beat - 1), { repeat: bar.inRepeat }]" @click="setPosition($event)"><span>{{bar.barIdx * 4 + beat}}</span></td>
						</template>
					</tr>
				</thead>
				<tbody>
					<tr v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<th>{{config.instruments[instrumentKey].name()}}</th>
						<td class="instrument-operations">
							<HeadphonesButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" groupSurdos />
							<MuteButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" />
						</td>
						<td v-for="stroke in renderedStrokes" :key="stroke.i" class="stroke" :class="[...getStrokeClass(stroke.i, instrumentKey), ternaryCSSClasses[instrumentKey][stroke.i - pattern.upbeat], { repeat: stroke.inRepeat }]" v-tooltip="config.strokesDescription[pattern[instrumentKey][stroke.i]]?.() || ''">
							<span v-if="readonly" class="stroke-inner">{{config.strokes[pattern[instrumentKey][stroke.i]]}}</span>
							<a v-if="!readonly"
								href="javascript:" class="stroke-inner"
								:id="`bb-pattern-player-stroke-${instrumentKey}-${stroke.i}`"
								@click="clickStroke(instrumentKey, stroke.i)"
								draggable="false"
							>
								{{config.strokes[pattern[instrumentKey][stroke.i]] || '\xa0'}}
							</a>
						</td>
					</tr>
				</tbody>
			</table>

			<AbstractPlayer
				:player="playerRef"
				:rawPattern="rawPattern"
				:playbackSettings="playbackSettings"
				:getLeft="getPositionMarkerLeft"
				:getScrollContext="getScrollContext"
				@position="handlePosition"
				ref="abstractPlayerRef"
			/>

			<div v-if="currentStrokeDropdown" class="popover bs-popover-auto fade" ref="strokeDropdownRef">
				<div class="popover-arrow"></div>
				<div class="popover-body">
					<StrokeDropdown :instrument="currentStrokeDropdown.instr" :model-value="pattern[currentStrokeDropdown.instr][currentStrokeDropdown.i] || ' '" @change="onStrokeChange($event, false)" @change-prev="onStrokeChange($event, true)" @prev="onStrokePrevNext(true)" @next="onStrokePrevNext(false)" @close="closeStrokeDropdown()" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-condensed-toggle svg {
		width: 1.25em;
		height: 1.25em;
		vertical-align: -0.25em;
	}

	.bb-pattern-player-container {
		width: 100%;
		overflow-x: auto;
		padding: 1em 0;
		position: relative;

		.bb-pattern-player {
			table-layout: fixed;
			/* The separate border model (rather than Bootstrap's collapse) makes the cell backgrounds extend */
			/* under the cell borders, so that the transparent stroke separators stay invisible on the grey */
			/* background of repeated blocks in the condensed view */
			border-collapse: separate;
			border-spacing: 0;

			.stroke {
				text-align: center;
				position: relative;
				overflow: visible;
				padding: 0;

				.stroke-inner {
					color: rgb(33, 37, 41);
				}

				&.is-triplet .stroke-inner {
					color: var(--bs-pink);
				}

				&.repeat {
					background-color: #ececec;
				}

				&.has-changes {
					background-color: #fbe8d0;
				}
			}

			&.compose {
				.stroke {
					border-right: 1px solid #f3f3f3;
				}
			}

			&.listen {
				.stroke {
					/* Transparent (rather than white) so that the separators stay invisible on the grey */
					/* background of repeated blocks in the condensed view */
					border-right: 1px solid transparent;
				}
			}

			&.listen tr:last-child {
				.stroke-inner:not(:empty) {
					/* Shouting: Hide table lines behind overlapping text */
					background-color: #fff;
				}

				.stroke.repeat .stroke-inner:not(:empty) {
					background-color: #ececec;
				}
			}

			.stroke-inner {
				display: inline-block;
				min-width: 2.7ex;
				min-height: 1em;
				text-decoration: none;
				/* Paint above the (position: relative) stroke cells, so that text that is wider than its cell */
				/* (e.g. at high subdivisions) is not painted over by the backgrounds of the following cells */
				/* (e.g. in repeated blocks of the condensed view) */
				position: relative;
				z-index: 1;
			}

			thead td {
				border-bottom: 1px solid #aaa;
				padding-bottom: .5ex;
			}

			thead tr.indicator-row td,
			thead tr.tempo-row td {
				border-bottom: none;
				padding-bottom: 0;
			}

			thead td.tempo-mark-cell {
				font-size: 0.85em;
				font-weight: bold;
				text-align: left;
				white-space: nowrap;
				padding: 0 0.5ex 0.25ex;
				overflow: visible;

				// The bar line is extended up through the tempo row at the marked bar, so that the mark
				// visually sits on the bar line where the tempo changes
				&.has-mark {
					border-left: 2px solid #888;
				}
			}

			thead td.repeat-count {
				font-size: 0.85em;
				font-weight: bold;
				text-align: left;
				white-space: nowrap;
				padding: 0 0.5ex 0.25ex;
				overflow: visible;

				.repeat-dynamics {
					font-weight: normal;
					font-style: italic;
				}

				&.repeat {
					background-color: #ececec;
				}

				// The bar lines are extended up through the indicator row where a block starts/ends. The start
				// line is drawn as a box shadow reaching into the preceding cell, so that it aligns with the
				// bar line below (the border-right of the bar's last stroke) instead of shifting the block's
				// first column by the border width (the table uses the separate border model).
				&.repeat-start {
					box-shadow: -2px 0 0 #888;
				}

				&.repeat-end {
					border-right: 2px solid #888;
				}

				.repeat-buttons {
					margin-left: 0.5ex;
				}

				.repeat-count-btn {
					border: none;
					background: none;
					padding: 0 0.5ex;
					font-size: 0.85em;
					color: #666;
					cursor: pointer;

					&:hover:not(:disabled) {
						color: #000;
					}

					&:disabled {
						color: #ccc;
						cursor: default;
					}
				}
			}

			.beat.repeat {
				background-color: #ececec;
			}

			.beat, .stroke.before-beat {
				border-right: 1px solid #aaa;
			}

			.instrument-operations, .stroke.before-bar, .beat.before-bar {
				border-right: 2px solid #888;
			}

			.instrument-operations {
				text-align: right;

				a + a {
					margin-left: 0.25rem;
				}
			}

			.beat {
				cursor: pointer;
			}

			.beat span {
				display: inline-block;
				padding: 0 .5ex;
				border-radius: 10px;
				transition: background-color 1s, color 1s;
			}

			.beat.active span {
				background-color: #3a94a5;
				color: #fff;
				transition: none;
			}

			tbody th {
				padding-right: 1ex;
			}

			tbody th, td.instrument-operations {
				white-space: nowrap;
			}
		}

		.bb-pattern-player {

			&.time-2 { /* 64px/beat */
				.stroke { max-width: 32px; }
				.stroke-inner { min-width: 32px; }
			}

			&.time-3 { /* 63px/beat */
				.stroke { max-width: 21px; }
				.stroke-inner { min-width: 21px; }
			}

			&.time-4 { /* 64px/beat */
				.stroke { max-width: 16px; }
				.stroke-inner { min-width: 16px; }
			}

			&.time-5 { /* 65px/beat */
				.stroke { max-width: 13px; }
				.stroke-inner { min-width: 13px; }
			}

			&.time-6 { /* 66px/beat */
				.stroke { max-width: 11px; }
				.stroke-inner { min-width: 11px; }
			}

			&.time-8 { /* 76px/beat */
				.stroke { max-width: 9.5px; }
				.stroke-inner { min-width: 9.5px; }
			}

			&.time-9 { /* 76.5px/beat */
				.stroke { max-width: 8.5px; }
				.stroke-inner { min-width: 8.5px; }
			}

			&.time-12.compose,
			&.time-16.compose,
			&.time-20.compose,
			&.time-24.compose {
				.stroke { max-width: 8px; }
				.stroke-inner { min-width: 8px; }
			}

			&.time-12.listen { /* 78px/beat */
				.stroke { max-width: 6.5px; }
				.stroke-inner { min-width: 6.5px; }
			}

			&.time-16.listen { /* 80px/beat */
				.stroke { max-width: 5px; }
				.stroke-inner { min-width: 5px; }
			}

			&.time-20.listen { /* 80px/beat */
				.stroke { max-width: 4px; }
				.stroke-inner { min-width: 4px; }
			}

			&.time-24.listen { /* 84px/beat */
				.stroke { max-width: 3.5px; }
				.stroke-inner { min-width: 3.5px; }
			}

			&.time-2 {
				.stroke-0 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-3 {
				.stroke--2, .stroke-0, .stroke-1 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-4 {
				.stroke--2, .stroke--3,
				.stroke-0, .stroke-1, .stroke-2 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-5 {
				.stroke--2, .stroke--3, .stroke--4,
				.stroke-0, .stroke-1, .stroke-2, .stroke-3 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-6 {
				.stroke--3, .stroke--5,
				.stroke-1,  .stroke-3, {
					border-right: 1px solid #ddd;
				}
			}

			&.time-8 {
				.stroke--3, .stroke--5, .stroke--7,
				.stroke-1,  .stroke-3,  .stroke-5 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-9 {
				.stroke--4, .stroke--7,
				.stroke-2,  .stroke-5 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-12 {
				.stroke:not(.is-triplet) {
					&.stroke--4, &.stroke--7, &.stroke--10,
					&.stroke-2,  &.stroke-5,  &.stroke-8 {
						border-right: 1px solid #ddd;
					}
				}
				.stroke.is-triplet {
					&.stroke--5, &.stroke--9,
					&.stroke-3,  &.stroke-7 {
						border-right: 1px solid #ddd;
					}
				}
			}

			&.time-16 {
				.stroke--5, .stroke--9, .stroke--13,
				.stroke-3,  .stroke-7,  .stroke-11 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-20 {
				.stroke--6, .stroke--11, .stroke--16,
				.stroke-4,  .stroke-9,   .stroke-14 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-24 {
				.stroke:not(.is-triplet) {
					&.stroke--7, &.stroke--13, &.stroke--19,
					&.stroke-5,  &.stroke-11,  &.stroke-17 {
						border-right: 1px solid #ddd;
					}
				}
				.stroke.is-triplet {
					&.stroke--9, &.stroke--17,
					&.stroke-7,  &.stroke-15 {
						border-right: 1px solid #ddd;
					}
				}
			}
		}
	}
</style>
