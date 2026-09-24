/**
 * Tempo resampling for the speed hack (see src/state/pattern.ts).
 *
 * beatbox.js only supports a single global stroke length, so tempo changes cannot be played by changing the
 * beat length mid-pattern (that would also break MP3 export, which renders offline without events). Instead,
 * the changes are baked into the raw beatbox pattern: the strokes behind a speed change are moved closer
 * together (or further apart) on the fixed grid of config.playTime slots per beat.
 *
 * Each stroke's exact time is accumulated as a fraction and rounded to the nearest slot individually, so the
 * error of a single stroke is at most half a slot, the error of the interval between two strokes is less than
 * one slot (~1.4ms at 60bpm with playTime 720, inaudible) and there is no cumulative tempo drift.
 */

export type TempoMark = {
	/** The slot (raw index into the un-resampled pattern, including upbeat slots) at which the factor takes effect. */
	slot: number;
	/** The speed factor relative to the playback speed from this slot on (1 = unchanged, 2 = double speed). */
	factor: number;
};

export type TempoMapSegment = {
	/** The first slot of the segment in the un-resampled (musical grid) pattern. */
	grid: number;
	/** The (fractional) slot in the resampled pattern that the grid slot maps to. */
	real: number;
	/** The speed factor of the segment: one grid slot takes 1/factor resampled slots. */
	factor: number;
};

/**
 * Builds the piecewise-linear mapping between grid slots and resampled slots for the given tempo marks.
 * Returns undefined if the marks do not contain any effective tempo change.
 */
export function buildTempoMap(marks: TempoMark[]): TempoMapSegment[] | undefined {
	const sorted = [...marks].sort((a, b) => a.slot - b.slot);
	const segments: TempoMapSegment[] = [{ grid: 0, real: 0, factor: 1 }];
	for (const mark of sorted) {
		const last = segments[segments.length - 1];
		if (mark.factor === last.factor) {
			continue;
		}
		if (mark.slot <= last.grid) {
			// A mark at (or before) the previous one replaces its factor
			last.factor = mark.factor;
		} else {
			segments.push({ grid: mark.slot, real: gridToReal(segments, mark.slot), factor: mark.factor });
		}
	}
	return segments.length > 1 || segments[0].factor !== 1 ? segments : undefined;
}

/** Maps a slot of the un-resampled pattern to the corresponding (fractional) slot of the resampled pattern. */
export function gridToReal(map: TempoMapSegment[], slot: number): number {
	let segment = map[0];
	for (const candidate of map) {
		if (candidate.grid > slot) {
			break;
		}
		segment = candidate;
	}
	return segment.real + (slot - segment.grid) / segment.factor;
}

/** Maps a (possibly fractional) slot of the resampled pattern back to the corresponding slot of the un-resampled pattern. */
export function realToGrid(map: TempoMapSegment[], slot: number): number {
	let segment = map[0];
	for (const candidate of map) {
		if (candidate.real > slot) {
			break;
		}
		segment = candidate;
	}
	return segment.grid + (slot - segment.real) * segment.factor;
}

/**
 * Resamples a sparse pattern array (one entry per slot, each entry a list of strokes) through the given tempo
 * map. Strokes that end up on the same slot (possible for extreme speed-ups) are merged. The length of the
 * returned array is the mapped length of the input array.
 */
export function resamplePattern<T>(pattern: Array<T[] | undefined>, map: TempoMapSegment[]): Array<T[] | undefined> {
	const ret: Array<T[] | undefined> = [];
	pattern.forEach((strokes, i) => {
		if (strokes && strokes.length > 0) {
			const target = Math.round(gridToReal(map, i));
			const existing = ret[target];
			ret[target] = existing ? existing.concat(strokes) : strokes;
		}
	});
	const length = Math.round(gridToReal(map, pattern.length));
	if (ret.length < length) {
		ret.length = length;
	}
	return ret;
}
