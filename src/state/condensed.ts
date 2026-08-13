import config, { Instrument } from "../config";
import { InstrumentVolumeHack, Pattern } from "./pattern";

/**
 * A condensed, render-ready representation of the patterns of a tune, used to generate printable tune sheets
 * and the condensed view of the pattern player.
 * Compared to the way patterns are stored in the state, the condensed representation differs in several ways:
 * - Instruments that don't play anything in a pattern are omitted.
 * - Instruments that play identical lines are merged into a single row (with a label like “Everybody” or a list
 *   of instrument names).
 * - Bars that are repeated are rendered only once with a repeat count (“×4”).
 * - Volume changes (specified through the volume hack) are preserved as textual annotations above the bars
 *   where they happen: ramps as “soft to loud”/“loud to soft”, constant sections as “soft”/“loud”.
 * - Tempo changes (specified through the speed hack) become marks (“speed up”/“slow down”) at the bar lines
 *   where they happen. A repetition never extends across a tempo change — except when the speed steps up/down uniformly
 *   once per iteration, which stays condensed and is annotated on the block as a whole (accelerando over the
 *   repetitions).
 */

/** How a condensed row (a group of instruments playing the same line) should be labelled. */
export type CondensedRowLabel =
	/** All instruments play the same thing, the row is labelled “Everybody”. */
	"everybody" |
	/** The row covers all the instruments that are not listed in any other row, it is labelled “Everybody else”. */
	"everybody-else" |
	/** The row is labelled with the names of its instruments. */
	"instruments";

export type CondensedRow = {
	/** The instruments that play this line, in the order of config.instrumentKeys. */
	instruments: Instrument[];
	label: CondensedRowLabel;
	/** The full (uncondensed) strokes of the line, including the upbeat strokes at the start. Silence is represented as " ". */
	strokes: string[];
};

/**
 * A section of a pattern as rendered in the condensed representation: a range of bars and how often it is
 * repeated. A pattern whose
 * bars cannot be condensed is represented as a single segment with repeat 1.
 */
export type CondensedSegment = {
	/** The index of the first bar of the segment (bar 0 is the first bar after the upbeat). */
	startBar: number;
	/** The number of bars that this segment spans. */
	bars: number;
	/** How often the segment is played in a row. */
	repeat: number;
	/**
	 * Set if the volumes (through the volume hack) form a monotonic ramp across the segment, which is
	 * indicated textually above the segment (next to the repeat count for repeated segments).
	 */
	dynamics?: "crescendo" | "decrescendo";
	/**
	 * Set if the volumes are constant across the segment but softer/louder than the normal volume, which is
	 * indicated textually above the segment (next to the repeat count for repeated segments).
	 */
	volume?: "soft" | "loud";
	/**
	 * The instruments that the dynamics/volume annotation applies to. Unset if it applies to all instruments
	 * that have sounding strokes within the annotated bars.
	 */
	annotationInstruments?: Instrument[];
	/**
	 * The instruments that have sounding strokes within the annotated bars, used as the base set when phrasing
	 * the annotation (“Snare: …” vs “All but Repi: …”). Set if and only if annotationInstruments is set.
	 */
	annotationAllInstruments?: Instrument[];
	/**
	 * Set if the segment repeats indefinitely (through the pattern's openRepeats), rendered as “N×”.
	 * Can also be set on a single bar with repeat 1 (when no repetition was detected at the requested beat),
	 * which renders that bar as an open-ended repeat block.
	 */
	open?: boolean;
	/**
	 * Set if the speed steps up/down uniformly at the start of each iteration of the repeated segment (through
	 * the speed hack): the bpm delta of a single step. The corresponding tempo mark is emitted at the start of
	 * the segment (see CondensedTempoMark.iterations).
	 */
	tempoStep?: number;
};

/**
 * A tempo change (through the speed hack) as rendered in the condensed representation: a “speed up”/“slow down”
 * mark at the bar line of a bar.
 */
export type CondensedTempoMark = {
	/** The bar (bar 0 is the first bar after the upbeat) at whose bar line the mark is rendered. */
	bar: number;
	/**
	 * The bpm change happening at this mark, relative to the previously prevailing speed. The sign determines
	 * the direction of the mark (speed up or slow down). For per-iteration marks, the change of a single step.
	 */
	step: number;
	/**
	 * Set if the mark sits at the start of a repeated segment whose speed steps up/down by `step` at each
	 * iteration (accelerando over the repetitions): the repeat count of the segment.
	 */
	iterations?: number;
};

export type CondensedPattern = {
	/** Number of strokes per beat. */
	time: number;
	/** Number of upbeat strokes prepended before the first bar. */
	upbeat: number;
	/** The total number of bars of the (uncondensed) pattern body, excluding the upbeat. */
	totalBars: number;
	rows: CondensedRow[];
	segments: CondensedSegment[];
	/** The tempo changes of the pattern, ordered by bar. Every mark refers to a rendered bar. */
	tempoMarks: CondensedTempoMark[];
};

const BEATS_PER_BAR = 4;

/** Instrument groups of at least this size can be labelled “Everybody”/“Everybody else”. */
const EVERYBODY_MIN_INSTRUMENTS = 4;

/** Returns the strokes of an instrument as a dense array of the given length, with silence represented as " ". */
function getDenseStrokes(pattern: Pattern, instrument: Instrument, length: number): string[] {
	const line = pattern[instrument] || [];
	const ret: string[] = [];
	for (let i = 0; i < length; i++) {
		const stroke = line[i] || " ";
		ret.push(stroke.trim() === "" ? " " : stroke);
	}
	return ret;
}

/**
 * Returns the effective volume of each stroke of an instrument as specified through the volume hack: a volume
 * defined for one stroke index applies to all following strokes until the next defined volume.
 */
function getEffectiveVolumes(volumeHack: InstrumentVolumeHack | undefined, instrument: Instrument, length: number): number[] {
	const hack = volumeHack?.[instrument] ?? {};
	const ret: number[] = [];
	let volume = 1;
	for (let i = 0; i < length; i++) {
		if (hack[i] != null) {
			volume = hack[i];
		}
		ret.push(volume);
	}
	return ret;
}

/**
 * The volume of silent strokes is inaudible, so it is normalized to the volume of the nearest sounding stroke.
 * This avoids that volume changes during silence prevent rows from being merged or bars from being condensed.
 */
function maskSilentVolumes(strokes: string[], volumes: number[]): number[] {
	const firstSounding = strokes.findIndex((stroke) => stroke !== " ");
	let current = firstSounding === -1 ? 1 : volumes[firstSounding];
	return volumes.map((volume, i) => {
		if (strokes[i] === " ") {
			return current;
		}
		current = volume;
		return volume;
	});
}

type RawRow = {
	instruments: Instrument[];
	strokes: string[];
	/** The unmasked effective volumes, used for the repeat volume checks and the volume annotations. */
	volumes: number[];
};

/** Groups the sounding instruments of a pattern by identical stroke lines (and identical volume curves). */
function getRawRows(pattern: Pattern, length: number): RawRow[] {
	const rows: RawRow[] = [];
	const byKey = new Map<string, RawRow>();
	for (const instrument of config.instrumentKeys) {
		const strokes = getDenseStrokes(pattern, instrument, length);
		if (strokes.every((stroke) => stroke === " ")) {
			continue;
		}

		const volumes = getEffectiveVolumes(pattern.volumeHack, instrument, length);
		const key = `${strokes.join("\n")}\u0000${maskSilentVolumes(strokes, volumes).join(",")}`;
		const existing = byKey.get(key);
		if (existing) {
			existing.instruments.push(instrument);
		} else {
			const row = { instruments: [instrument], strokes, volumes };
			byKey.set(key, row);
			rows.push(row);
		}
	}
	return rows;
}

/**
 * Returns whether the given instruments can be fully expressed through the configured instrument aliases (a union
 * of complete alias groups with no instruments left over).
 */
function isFullyAliased(instruments: Instrument[]): boolean {
	if (!config.instrumentAliases?.length) {
		return false;
	}
	const remaining = new Set(instruments);
	for (const alias of [...config.instrumentAliases].sort((a, b) => b.instruments.length - a.instruments.length)) {
		if (alias.instruments.length > 0 && alias.instruments.every((instrument) => remaining.has(instrument))) {
			for (const instrument of alias.instruments) {
				remaining.delete(instrument);
			}
		}
	}
	return remaining.size === 0;
}

/** Decides how each row group should be labelled and orders “Everybody else” rows last. */
function labelRows(rows: RawRow[]): CondensedRow[] {
	const labelled = rows.map((row): CondensedRow => ({
		instruments: row.instruments,
		label: "instruments",
		strokes: row.strokes
	}));

	if (labelled.length === 1) {
		if (labelled[0].instruments.length >= EVERYBODY_MIN_INSTRUMENTS) {
			labelled[0].label = "everybody";
		}
		return labelled;
	}

	const sorted = [...labelled].sort((a, b) => b.instruments.length - a.instruments.length);
	const largest = sorted[0];
	if (
		largest.instruments.length >= EVERYBODY_MIN_INSTRUMENTS && largest.instruments.length > sorted[1].instruments.length &&
		// Rows that can be labelled through aliases keep that label (and their position in the instrument order)
		!isFullyAliased(largest.instruments)
	) {
		largest.label = "everybody-else";
		return [...labelled.filter((row) => row !== largest), largest];
	}

	return labelled;
}

/**
 * Tries to find a condensed segment representation of the pattern body, greedily detecting consecutive
 * repetitions of units of any number of bars (a single repeated bar, a repeated 2/3/4-bar phrase, …) anywhere
 * in the pattern.
 * @param barsEqual Returns whether two bars (given as bar indexes) have identical strokes (ignoring volumes).
 * @param validateRepeat Validates the volumes and tempo changes of a candidate repetition (`repeat`
 *     repetitions of a `bars`-bar unit starting at `startBar`): returns the annotations that the repeated
 *     segment should carry (dynamics for a volume ramp across the repetitions, tempoStep for a uniform speed
 *     step at each iteration; both empty if the repetitions are truly identical), or false if the volumes or
 *     tempo changes are incompatible with the repetition (in which case a shorter repetition is tried).
 * @param boundaries Bars that repetitions must not extend across (but may start or end at): the bars whose
 *     repetition is forced open through openRepeats. This re-anchors the greedy detection at those bars,
 *     which could otherwise detect a different phase of the same repetition starting earlier in the pattern.
 * @returns The segments, or undefined if no representation was found that is shorter than the full pattern.
 */
function findSegments(
	totalBars: number,
	barsEqual: (a: number, b: number) => boolean,
	validateRepeat: (startBar: number, bars: number, repeat: number) => Pick<CondensedSegment, "dynamics" | "tempoStep"> | false,
	boundaries: number[]
): CondensedSegment[] | undefined {
	if (totalBars < 2) {
		return undefined;
	}

	const rangeEqual = (a: number, b: number, bars: number) => {
		for (let i = 0; i < bars; i++) {
			if (!barsEqual(a + i, b + i)) {
				return false;
			}
		}
		return true;
	};

	const segments: CondensedSegment[] = [];
	let bar = 0;
	while (bar < totalBars) {
		// Find the unit size whose consecutive repetition starting at this bar saves the most bars, not
		// extending across the next boundary
		const limit = boundaries.reduce((min, boundary) => (boundary > bar && boundary < min ? boundary : min), totalBars);
		let best: CondensedSegment | undefined;
		for (let unit = 1; bar + 2 * unit <= limit; unit++) {
			let maxRepeat = 1;
			while (bar + (maxRepeat + 1) * unit <= limit && rangeEqual(bar, bar + maxRepeat * unit, unit)) {
				maxRepeat++;
			}
			// Among the stroke-identical repetitions, use the longest prefix with compatible volumes and tempo changes
			for (let repeat = maxRepeat; repeat >= 2; repeat--) {
				const annotations = validateRepeat(bar, unit, repeat);
				if (annotations !== false) {
					if (!best || (repeat - 1) * unit > (best.repeat - 1) * best.bars) {
						best = { startBar: bar, bars: unit, repeat, ...annotations };
					}
					break;
				}
			}
		}

		if (best) {
			segments.push(best);
			bar += best.bars * best.repeat;
		} else {
			const last = segments[segments.length - 1];
			if (last && last.repeat === 1) {
				last.bars++;
			} else {
				segments.push({ startBar: bar, bars: 1, repeat: 1 });
			}
			bar++;
		}
	}

	if (segments.reduce((sum, segment) => sum + segment.bars, 0) < totalBars) {
		return segments;
	}

	return undefined;
}

/**
 * Tolerance for the volume comparisons of the annotations: generated ramps (e.g. the crescendo() helper of the
 * tune definitions) can end a floating-point rounding error away from the exact target volume.
 */
const VOLUME_EPSILON = 0.001;

type VolumeSpan = {
	/** The index of the first bar of the span. */
	start: number;
	/** The index of the bar after the last bar of the span. */
	end: number;
	label: NonNullable<CondensedSegment["dynamics"] | CondensedSegment["volume"]>;
	/** The instruments the span applies to. Unset if it applies to all instruments sounding within the span. */
	instruments?: Instrument[];
	/** The instruments that have sounding strokes within the span. Set if and only if instruments is set. */
	allInstruments?: Instrument[];
};

/** Returns whether the row has at least one sounding stroke in the given stroke range (end exclusive). */
function soundsWithin(row: RawRow, from: number, to: number): boolean {
	for (let i = from; i < to; i++) {
		if (row.strokes[i] !== " ") {
			return true;
		}
	}
	return false;
}

/**
 * Finds the sections of the (uncondensed) pattern body whose volumes (through the volume hack) should be
 * indicated textually above the bars: maximal runs of bars across which the volumes ramp monotonically become
 * crescendo/decrescendo spans, and maximal runs of bars with constant volumes become soft/loud spans (if at
 * least one row is softer/louder than the normal volume 1 and none deviates in the other direction).
 * Constant sections connected by at least two volume steps in the same direction form a stepped fade and
 * become a single crescendo/decrescendo span as well — matching the annotation that the same volumes get
 * when they ramp across the iterations of a condensed repeated block (see getRepeatDynamics).
 */
function getVolumeSpans(allRows: RawRow[], upbeat: number, barStrokes: number, totalBars: number): VolumeSpan[] {
	// A row whose volume never changes plays at a constant offset (e.g. an instrument that is just a bit
	// quieter or louder in the mix), which is not a volume indication for the players, so only rows whose
	// volume changes somewhere in the pattern are considered.
	const rows = allRows.filter((row) => row.volumes.some((volume) => Math.abs(volume - row.volumes[0]) > VOLUME_EPSILON));
	if (rows.length === 0) {
		return [];
	}

	const length = rows[0].volumes.length;
	const barStart = (bar: number) => upbeat + bar * barStrokes;

	// The direction of the volume changes in the given stroke range (comparing each stroke to its predecessor,
	// end exclusive), across all rows
	const getDirection = (from: number, to: number): "up" | "down" | "mixed" | undefined => {
		let up = false;
		let down = false;
		for (const row of rows) {
			for (let i = from; i < to; i++) {
				const diff = row.volumes[i] - row.volumes[i - 1];
				up ||= diff > VOLUME_EPSILON;
				down ||= diff < -VOLUME_EPSILON;
			}
		}
		return up && down ? "mixed" : up ? "up" : down ? "down" : undefined;
	};

	const withinBar = (bar: number) => getDirection(barStart(bar) + 1, Math.min(barStart(bar + 1), length));
	// The volume step between the last stroke of the previous bar and the first stroke of this bar
	const stepBefore = (bar: number) => getDirection(barStart(bar), barStart(bar) + 1);

	// The volume level at the start of the given (constant) bar: “normal” if all rows play at the normal
	// volume 1, undefined if some rows are softer and others louder (which gets no annotation)
	const getLevel = (bar: number): "soft" | "loud" | "normal" | undefined => {
		const volumes = rows.map((row) => row.volumes[barStart(bar)]);
		if (volumes.every((volume) => Math.abs(volume - 1) <= VOLUME_EPSILON)) {
			return "normal";
		} else if (volumes.some((volume) => volume < 1 - VOLUME_EPSILON) && volumes.every((volume) => volume <= 1 + VOLUME_EPSILON)) {
			return "soft";
		} else if (volumes.some((volume) => volume > 1 + VOLUME_EPSILON) && volumes.every((volume) => volume >= 1 - VOLUME_EPSILON)) {
			return "loud";
		} else {
			return undefined;
		}
	};

	// The row indexes that deviate from the normal volume at the start of the given (constant) bar, used to
	// decide whether adjacent constant sections can be annotated as one span
	const getDeviatingRows = (bar: number) =>
		rows.map((row, index) => (Math.abs(row.volumes[barStart(bar)] - 1) > VOLUME_EPSILON ? index : -1)).filter((index) => index >= 0).join(",");

	/** A constant section within a run of adjacent constant sections (which are separated by volume steps). */
	type ConstantSection = {
		start: number;
		end: number;
		level: ReturnType<typeof getLevel>;
		deviatingRows: string;
		/** The direction of the volume step between the previous section of the run and this one. */
		stepDir?: "up" | "down" | "mixed";
	};

	const spans: VolumeSpan[] = [];
	let lastDeviatingRows: string | undefined;

	/**
	 * Emits the spans of a run of adjacent constant sections: sections connected by at least two volume steps
	 * in the same direction form a stepped fade and become a single crescendo/decrescendo span; the remaining
	 * sections become soft/loud spans, with adjacent same-label sections that affect the same rows (e.g. a
	 * soft section that steps up and back down) merged into one span.
	 */
	const flushRun = (run: ConstantSection[]) => {
		let i = 0;
		while (i < run.length) {
			// The longest stepped fade starting at this section: consecutive sections (of unambiguous
			// levels) whose connecting steps all go the same direction
			const dir = run[i + 1]?.stepDir;
			let j = i;
			if ((dir === "up" || dir === "down") && run[i].level) {
				while (j + 1 < run.length && run[j + 1].stepDir === dir && run[j + 1].level) {
					j++;
				}
			}
			if (j - i >= 2) {
				spans.push({ start: run[i].start, end: run[j].end, label: dir === "up" ? "crescendo" : "decrescendo" });
				lastDeviatingRows = undefined;
				i = j + 1;
			} else {
				const section = run[i];
				if (section.level === "soft" || section.level === "loud") {
					const last = spans[spans.length - 1];
					if (last?.end === section.start && last.label === section.level && lastDeviatingRows === section.deviatingRows) {
						last.end = section.end;
					} else {
						spans.push({ start: section.start, end: section.end, label: section.level });
						lastDeviatingRows = section.deviatingRows;
					}
				}
				i++;
			}
		}
	};

	let run: ConstantSection[] = [];
	let bar = 0;
	while (bar < totalBars) {
		const direction = withinBar(bar);
		if (direction === "mixed") {
			flushRun(run);
			run = [];
			bar++;
		} else if (direction) {
			flushRun(run);
			run = [];
			// A ramp: extend it across adjacent bars that keep ramping in the same direction
			let end = bar + 1;
			while (end < totalBars && withinBar(end) === direction && (stepBefore(end) ?? direction) === direction) {
				end++;
			}
			spans.push({ start: bar, end, label: direction === "up" ? "crescendo" : "decrescendo" });
			lastDeviatingRows = undefined;
			bar = end;
		} else {
			// A constant section: extend it across adjacent bars with the same constant volumes
			let end = bar + 1;
			while (end < totalBars && !withinBar(end) && !stepBefore(end)) {
				end++;
			}
			run.push({ start: bar, end, level: getLevel(bar), deviatingRows: getDeviatingRows(bar), stepDir: run.length ? stepBefore(bar) : undefined });
			bar = end;
		}
	}
	flushRun(run);

	// Determine which instruments each span applies to: the rows that actually ramp within a
	// crescendo/decrescendo span, or that are softer/louder than the normal volume within a soft/loud span.
	// Only sounding strokes are considered — an instrument that is silent during the span is not part of the
	// annotation. If the affected rows cover all instruments sounding within the span, it applies to everybody.
	for (const span of spans) {
		const from = barStart(span.start);
		const to = Math.min(barStart(span.end), length);
		const isLevel = span.label === "soft" || span.label === "loud";
		const affected = rows.filter((row) => {
			let first: number | undefined;
			for (let i = from; i < to; i++) {
				if (row.strokes[i] === " ") {
					continue;
				}
				first ??= row.volumes[i];
				if (Math.abs(row.volumes[i] - (isLevel ? 1 : first)) > VOLUME_EPSILON) {
					return true;
				}
			}
			return false;
		});
		const instruments = affected.flatMap((row) => row.instruments);
		const allInstruments = allRows.filter((row) => soundsWithin(row, from, to)).flatMap((row) => row.instruments);
		if (instruments.length < allInstruments.length) {
			span.instruments = instruments;
			span.allInstruments = allInstruments;
		}
	}

	return spans;
}

/**
 * Attaches the volume spans to the segments: a repeated segment whose (uncondensed) bars are all covered by a
 * soft/loud span is annotated as a whole, and non-repeated segments are split up so that the covered bar
 * ranges become their own segments carrying the annotation.
 */
function applyVolumeAnnotations(segments: CondensedSegment[], spans: VolumeSpan[], rows: RawRow[], upbeat: number, barStrokes: number): CondensedSegment[] {
	const ret: CondensedSegment[] = [];
	for (const segment of segments) {
		if (segment.repeat > 1 || segment.open) {
			const end = segment.startBar + segment.bars * segment.repeat;
			if (segment.dynamics) {
				// The ramp across the repetitions already carries a dynamics annotation (validated by
				// getRepeatDynamics); determine which rows actually ramp (by their sounding strokes)
				const from = upbeat + segment.startBar * barStrokes;
				const to = upbeat + end * barStrokes;
				const affected = rows.filter((row) => {
					let first: number | undefined;
					for (let i = from; i < to; i++) {
						if (row.strokes[i] === " ") {
							continue;
						}
						first ??= row.volumes[i];
						if (Math.abs(row.volumes[i] - first) > VOLUME_EPSILON) {
							return true;
						}
					}
					return false;
				});
				const instruments = affected.flatMap((row) => row.instruments);
				const allInstruments = rows.filter((row) => soundsWithin(row, from, to)).flatMap((row) => row.instruments);
				if (instruments.length < allInstruments.length) {
					segment.annotationInstruments = instruments;
					segment.annotationAllInstruments = allInstruments;
				}
			} else {
				const span = spans.find((candidate) => candidate.start <= segment.startBar && candidate.end >= end);
				if (span?.label === "soft" || span?.label === "loud") {
					segment.volume = span.label;
					if (span.instruments) {
						segment.annotationInstruments = span.instruments;
						segment.annotationAllInstruments = span.allInstruments;
					}
				}
			}
			ret.push(segment);
			continue;
		}

		let bar = segment.startBar;
		const segmentEnd = segment.startBar + segment.bars;
		while (bar < segmentEnd) {
			const span = spans.find((candidate) => candidate.start <= bar && bar < candidate.end);
			if (span) {
				const end = Math.min(span.end, segmentEnd);
				// A stepped fade that started inside the preceding repeated block already carries its
				// annotation there (as the dynamics of the block), so its continuation is not re-annotated
				const prev = ret[ret.length - 1];
				const continuesAnnotated = (span.label === "crescendo" || span.label === "decrescendo") &&
					span.start < bar && prev != null && prev.dynamics === span.label && prev.startBar + prev.bars * prev.repeat === bar;
				ret.push({
					startBar: bar,
					bars: end - bar,
					repeat: 1,
					...(continuesAnnotated ? {} :
						span.label === "crescendo" || span.label === "decrescendo" ? { dynamics: span.label } : { volume: span.label }),
					...(!continuesAnnotated && span.instruments ? { annotationInstruments: span.instruments, annotationAllInstruments: span.allInstruments } : {})
				});
				bar = end;
			} else {
				const end = Math.min(segmentEnd, ...spans.map((candidate) => candidate.start).filter((start) => start > bar));
				ret.push({ startBar: bar, bars: end - bar, repeat: 1 });
				bar = end;
			}
		}
	}
	return ret;
}

/**
 * Generates the condensed representation of a single pattern.
 * With condense set to false, no repeat detection (and no open-repeat handling) takes place and the pattern
 * keeps its full length; the segments then only carry the volume annotations. This is used by the pattern
 * player to render the volume annotations above its uncondensed view.
 */
export function getCondensedPattern(pattern: Pattern, options?: { condense?: boolean }): CondensedPattern {
	const condense = options?.condense ?? true;
	const length = pattern.length * pattern.time + pattern.upbeat;
	let rawRows = getRawRows(pattern, length);

	if (rawRows.length === 0) {
		// A pattern in which nobody plays anything (e.g. a silence break) is rendered as a single empty “Everybody” row
		rawRows = [{
			instruments: [...config.instrumentKeys],
			strokes: Array.from({ length }, () => " "),
			volumes: Array.from({ length }, () => 1)
		}];
	}

	const barStrokes = BEATS_PER_BAR * pattern.time;
	const bodyBars = (pattern.length % BEATS_PER_BAR === 0) ? pattern.length / BEATS_PER_BAR : 0;
	const totalBars = Math.max(1, Math.ceil(pattern.length / BEATS_PER_BAR));

	// The bars whose repetition is forced open through openRepeats (which lists 1-based beat numbers)
	const openBars = (condense ? (pattern.openRepeats ?? []) : [])
		.map((beat) => (beat - 1) / BEATS_PER_BAR)
		.filter((bar) => Number.isInteger(bar) && bar >= 0 && bar < totalBars);

	// The tempo changes of the pattern (through the speed hack, which lists 1-based beat numbers), mapped to
	// the bars at whose bar line they are annotated. Points that do not change the prevailing speed are
	// dropped, so that they neither produce a mark nor prevent bars from being condensed.
	const speedChanges: Array<{ bar: number; delta: number; aligned: boolean }> = [];
	for (const beat of Object.keys(pattern.speedHack ?? {}).map(Number).sort((a, b) => a - b)) {
		const bar = Math.floor((beat - 1) / BEATS_PER_BAR);
		const prevailing = speedChanges.length ? speedChanges[speedChanges.length - 1].delta : 0;
		if (bar >= 0 && bar < totalBars && pattern.speedHack![beat] !== prevailing) {
			speedChanges.push({ bar, delta: pattern.speedHack![beat], aligned: (beat - 1) % BEATS_PER_BAR === 0 });
		}
	}

	let segments: CondensedSegment[] | undefined;

	if (condense && bodyBars >= 2) {
		const strokesEqual = (a: number, b: number) => rawRows.every((row) => {
			for (let i = 0; i < barStrokes; i++) {
				if (row.strokes[pattern.upbeat + a * barStrokes + i] !== row.strokes[pattern.upbeat + b * barStrokes + i]) {
					return false;
				}
			}
			return true;
		});

		// Bars are compared by strokes only; the volumes of a candidate repetition are then validated separately,
		// so that blocks whose volumes ramp up or down (through the volume hack) can still be condensed, with the
		// ramp indicated as a crescendo/decrescendo annotation on the repeated segment. Only the volumes of
		// sounding strokes are compared: volume changes during silence are inaudible, and considering them would
		// make identical-sounding repetitions look different (e.g. when the volume changes during leading silence
		// of the repetition, where the previous volume still lingers).
		const getRepeatDynamics = (startBar: number, bars: number, repeat: number): CondensedSegment["dynamics"] | false => {
			const base = pattern.upbeat + startBar * barStrokes;
			const unitStrokes = bars * barStrokes;
			const totalStrokes = repeat * unitStrokes;

			if (rawRows.every((row) => {
				for (let i = unitStrokes; i < totalStrokes; i++) {
					if (row.strokes[base + i] !== " " && row.volumes[base + i] !== row.volumes[base + (i % unitStrokes)]) {
						return false;
					}
				}
				return true;
			})) {
				return undefined;
			}

			for (const direction of [1, -1] as const) {
				if (rawRows.every((row) => {
					let last: number | undefined;
					for (let i = 0; i < totalStrokes; i++) {
						if (row.strokes[base + i] === " ") {
							continue;
						}
						const volume = row.volumes[base + i];
						if (last != null && (volume - last) * direction < 0) {
							return false;
						}
						last = volume;
					}
					return true;
				})) {
					return direction === 1 ? "crescendo" : "decrescendo";
				}
			}

			return false;
		};

		// Validates the tempo changes of a candidate repetition: a repetition must not contain any speed change —
		// except when the speed steps up/down uniformly at the start of each iteration after the first
		// (accelerando over the repetitions), which is annotated on the block as a whole. Returns the step of
		// such a per-iteration change, undefined if the candidate contains no speed change, and false if the
		// changes are incompatible with the repetition.
		const getRepeatTempoStep = (startBar: number, bars: number, repeat: number): number | undefined | false => {
			const inside = speedChanges.filter((change) => change.bar > startBar && change.bar < startBar + bars * repeat);
			if (inside.length === 0) {
				return undefined;
			}
			if (inside.length !== repeat - 1 || inside.some((change, k) => change.bar !== startBar + (k + 1) * bars || !change.aligned)) {
				return false;
			}
			const before = speedChanges.filter((change) => change.bar <= startBar);
			const base = before.length ? before[before.length - 1].delta : 0;
			const step = inside[0].delta - base;
			if (inside.some((change, k) => change.delta !== base + (k + 1) * step)) {
				return false;
			}
			return step;
		};

		const validateRepeat = (startBar: number, bars: number, repeat: number): Pick<CondensedSegment, "dynamics" | "tempoStep"> | false => {
			const tempoStep = getRepeatTempoStep(startBar, bars, repeat);
			if (tempoStep === false) {
				return false;
			}
			const dynamics = getRepeatDynamics(startBar, bars, repeat);
			if (dynamics === false) {
				return false;
			}
			return { ...(dynamics ? { dynamics } : {}), ...(tempoStep != null ? { tempoStep } : {}) };
		};

		segments = findSegments(bodyBars, strokesEqual, validateRepeat, openBars);
	}

	segments ??= [{ startBar: 0, bars: totalBars, repeat: 1 }];

	for (const bar of openBars) {
		const index = segments.findIndex((segment) => bar >= segment.startBar && bar < segment.startBar + segment.bars * segment.repeat);
		const segment = segments[index];
		if (!segment) {
			continue;
		}
		if (segment.repeat > 1) {
			if (segment.startBar === bar) {
				segment.open = true;
			}
		} else if (!segment.open) {
			// No repetition was detected starting at this bar (and since repetitions cannot extend across it,
			// no repetition covers it either), so just that one bar is turned into an open-ended repeat block
			// by splitting it out of its segment
			const replacement: CondensedSegment[] = [];
			if (bar > segment.startBar) {
				replacement.push({ startBar: segment.startBar, bars: bar - segment.startBar, repeat: 1 });
			}
			replacement.push({ startBar: bar, bars: 1, repeat: 1, open: true });
			if (bar + 1 < segment.startBar + segment.bars) {
				replacement.push({ startBar: bar + 1, bars: segment.startBar + segment.bars - (bar + 1), repeat: 1 });
			}
			segments.splice(index, 1, ...replacement);
		}
	}

	segments = applyVolumeAnnotations(segments, getVolumeSpans(rawRows, pattern.upbeat, barStrokes, totalBars), rawRows, pattern.upbeat, barStrokes);

	// Turn the speed changes into tempo marks at rendered bar lines. Changes that were validated as a
	// per-iteration step of a repeated segment are represented by a single mark at the start of the block
	// (the repetition detection guarantees that every other change lies on a rendered bar). Several changes
	// within the same bar (possible for speed hack points that are not at bar starts) merge into one mark.
	const tempoMarks: CondensedTempoMark[] = [];
	let prevailing = 0;
	for (const change of speedChanges) {
		const block = segments.find((segment) =>
			segment.tempoStep != null && change.bar > segment.startBar && change.bar < segment.startBar + segment.bars * segment.repeat);
		if (block) {
			if (!tempoMarks.some((mark) => mark.bar === block.startBar && mark.iterations != null)) {
				tempoMarks.push({ bar: block.startBar, step: block.tempoStep!, iterations: block.repeat });
			}
		} else {
			const last = tempoMarks[tempoMarks.length - 1];
			if (last && last.iterations == null && last.bar === change.bar) {
				last.step += change.delta - prevailing;
			} else {
				tempoMarks.push({ bar: change.bar, step: change.delta - prevailing });
			}
		}
		prevailing = change.delta;
	}

	return {
		time: pattern.time,
		upbeat: pattern.upbeat,
		totalBars,
		rows: labelRows(rawRows),
		segments,
		tempoMarks
	};
}
