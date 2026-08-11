import config, { Instrument, instrumentValidator, strokeValidator } from "../config";
import { isEqual } from "lodash-es";
import { clone, numberRecordValidator, requiredRecordValidator, transformValidator } from "../utils";
import { applyDiffString, getDiffString } from "./patternDiff";
import * as z from "zod";

/** The notes of a pattern: a set of strokes that each instrument plays in a certain order. It is wise to use a sparse array for the strokes. */
export type Beats = z.infer<typeof beatsValidator>;
export const beatsValidator = requiredRecordValidator(instrumentValidator.options, z.array(strokeValidator).default(() => []));

/** The notes of a pattern, compressed using compressPattern(). */
const beatsStringValidator = z.record(instrumentValidator, z.string().optional());

/**
 * A (hacky) way to specify a separate volume for each stroke in a pattern (for example to achieve crescendo), for all instruments at once.
 * A record where the key is the index in the stroke array and the value is the volume between 0 and 1.
 * Setting the volume for a particular stroke will also affect the following strokes within the same pattern (until a new volume is defined).
 */
export type AllVolumeHack = z.infer<typeof allVolumeHackValidator>;
export const allVolumeHackValidator = numberRecordValidator(z.number());

/**
 * A (hacky) way to specify a separate volume for each stroke in a pattern (for example to achieve crescendo) for each instrument.
 * Maps instrument keys to a record where the key is the index in the stroke array and the value is the volume between 0 and 1.
 * Setting the volume for a particular stroke will also affect the following strokes within the same pattern (until a new volume is defined).
 * For legacy reasons, also supports AllVolumeHack as an input type and automatically converts it.
 */
export type InstrumentVolumeHack = z.infer<typeof instrumentVolumeHackValidator>;
const strictInstrumentVolumeHackValidator = z.record(instrumentValidator, allVolumeHackValidator);
export const instrumentVolumeHackValidator = transformValidator(strictInstrumentVolumeHackValidator.or(allVolumeHackValidator), (val) => {
	if (Object.keys(val).every((key) => key.match(/^[0-9]+$/))) {
		// Legacy volume hack: one volume per stroke (not differentiated by instruments)
		return Object.fromEntries(config.instrumentKeys.map((instr) => [instr, clone(val)]));
	} else {
		return val;
	}
}, strictInstrumentVolumeHackValidator);

type PatternProperties = z.infer<typeof patternPropertiesValidator>;
const patternPropertiesValidator = z.object({
	length: z.number().default(4),
	time: z.coerce.number().finite().default(4), // For some reason, in some old patterns this is a string, see https://github.com/beatboxjs/ror-player/issues/46
	speed: z.number().default(() => config.defaultSpeed),
	upbeat: z.number().default(0),
	loop: z.boolean().default(false),
	displayName: z.string().optional(),
	volumeHack: instrumentVolumeHackValidator.optional(),
	/** If true, the pattern is not printed on the generated tune sheets (see src/ui/sheet/). */
	hideFromSheet: z.boolean().optional(),
	/**
	 * Beat numbers (1-based, as shown in the condensed pattern representation — on the tune sheets and in the
	 * condensed view of the pattern player) at which an indefinitely repeated block starts. The repeat count of
	 * such a block is rendered as “N×” instead of the number of times it appears in the pattern. The
	 * repetition detection is re-anchored at such a beat: no repetition may extend across it, so a repetition
	 * starting there is detected even if a different phase of it starts earlier in the pattern. If no
	 * repetition is detected at that beat, the single bar starting there is rendered as an open-ended (“N×”)
	 * repeat block instead.
	 */
	openRepeats: z.array(z.number()).optional()
});

/**
 * A pattern is a collection of strokes that each instruments plays in a certain order.
 */
export type Pattern = z.infer<typeof patternValidator>;
export const patternValidator = patternPropertiesValidator.and(beatsValidator).default(() => ({}));

export type PatternOptional = z.input<typeof patternValidator>;

export type CompressedPattern = z.infer<typeof compressedPatternValidator>;
export const compressedPatternValidator = patternPropertiesValidator.partial().and(beatsStringValidator);


export function normalizePattern(data?: PatternOptional): Pattern {
	return patternValidator.parse(data);
}


/**
 * Compresses a pattern object. For each instrument, whichever of the following is the smallest will be taken:
 * - A diff between the instrument line and any other instrument lines
 * - (If there is an original version of the pattern) a diff to the original
 * - The instrument line as is
 * @param pattern The pattern to compress
 * @param originalPattern Optional, a pattern object of the original pattern
 * @param encode Make is smaller by encoding the pattern
 * @returns A pattern object where some of the instruments have been replaced by diffs and the time and length
 *          properties have been removed if they don't differ from the original. The format is as follows:
 *          - If the instrument line starts with a '@', it is followed by a two-char instrument key and
 *            a diff to the line of that instrument (as returned by getDiffString()
 *          - If the instrument line starts with a '+', it is followed by a diff to the original instrument line
 *          - Otherwise, the string is the actual instrument line
 */
export function compressPattern(pattern: Pattern, originalPattern?: Pattern, encode?: boolean): CompressedPattern {
	const instrumentKeys = config.instrumentKeys;
	const le = pattern.length * pattern.time + pattern.upbeat;
	const ret: CompressedPattern = { };
	for(let i=0; i<instrumentKeys.length; i++) {
		if(originalPattern != null && isEqual(pattern[instrumentKeys[i]], originalPattern[instrumentKeys[i]]))
			continue;

		if(!pattern[instrumentKeys[i]]) {
			if(originalPattern && originalPattern[instrumentKeys[i]])
				ret[instrumentKeys[i]] = "";
			continue;
		}

		// Try out which is the shortest encoded version
		const original = pattern2str(pattern[instrumentKeys[i]], le);
		let encoded = original.replace(/ +$/, "");

		if(originalPattern == null && encoded.match(/^ *$/))
			continue;

		for(let i2=0; i2<i; i2++) {
			if(!pattern[instrumentKeys[i2]])
				continue;

			const thisEncoded = getDiffString(pattern2str(pattern[instrumentKeys[i2]], le), original);
			if(thisEncoded.length+3 < encoded.length && (encode || thisEncoded.length == 0)) {
				encoded = "@"+instrumentKeys[i2]+thisEncoded;
			}
		}

		if (encode) {
			const thisEncoded = getDiffString("", original);
			if(thisEncoded.length+1 < encoded.length)
				encoded = "!" + thisEncoded;

			if(originalPattern != null) {
				const thisEncoded = getDiffString(pattern2str(originalPattern[instrumentKeys[i]], originalPattern.length*originalPattern.time), original);
				if(thisEncoded.length+1 < encoded.length) {
					encoded = "+"+thisEncoded;
				}
			}
		}

		ret[instrumentKeys[i]] = encoded;
	}

	if(originalPattern == null ? (pattern.time != 4) : (pattern.time != originalPattern.time)) {
		ret.time = pattern.time;
	}
	if(originalPattern == null || pattern.length != originalPattern.length) {
		ret.length = pattern.length;
	}
	if(originalPattern == null ? (pattern.upbeat != 0) : (pattern.upbeat != originalPattern.upbeat)) {
		ret.upbeat = pattern.upbeat;
	}

	return ret;
}

/**
 * Represents a single beat of a pattern, as returned by splitPattern().
 */
export type PatternSlice = Array<string> & {
	/** The time signature of the pattern. */
	time: number;
	/** For a pattern containing an upbeat, the first beat will include the upbeat with this property containing the number of upbeat strokes. */
	upbeat: number;
};

/**
 * Splits the given pattern into individual beats. If the pattern has an upbeat, the upbeat will be included in the first beat
 * (with the upbeat property containing the number of strokes of the upbeat).
 */
export function splitPattern(pattern: Pattern, instrument: Instrument): Array<PatternSlice> {
	const ret: Array<PatternSlice> = [ ];
	let remaining = [...pattern[instrument]];

	if(remaining.length > 0) {
		ret.push(Object.assign(remaining.slice(0, 4*pattern.time + pattern.upbeat), {
			time: pattern.time,
			upbeat: pattern.upbeat
		}));
		remaining = remaining.slice(4*pattern.time + pattern.upbeat);
	}

	while(remaining.length > 0) {
		ret.push(Object.assign(remaining.slice(0, 4*pattern.time), {
			time: pattern.time,
			upbeat: 0
		}));
		remaining = remaining.slice(4*pattern.time);
	}

	return ret;
}

export function patternEquals(pattern: Pattern, pattern2: Pattern): boolean {
	if(pattern.length != pattern2.length)
		return false;
	if(pattern.time != pattern2.time)
		return false;
	if(pattern.upbeat != pattern2.upbeat)
		return false;
	if(!isEqual(pattern.volumeHack, pattern2.volumeHack))
		return false;

	const length = pattern.length * pattern.time + pattern.upbeat;
	for(const instr of config.instrumentKeys) {
		if(pattern2str(pattern[instr] || [ ], length) != pattern2str(pattern2[instr] || [ ], length))
			return false;
	}
	return true;
}

/**
 * Uncompresses a pattern object created by `compressPattern()`.
 * @param encodedPatternObject A compressed pattern object as returned by `compressPattern()`
 * @param originalPattern The original pattern object, if it exists
 * @returns A pattern object with an array of strokes for each instrument and a length and time property
 */
export function patternFromCompressed(encodedPatternObject: CompressedPattern, originalPattern?: Pattern): Pattern {
	const ret: PatternOptional = (originalPattern != null ? clone(originalPattern) : { });

	if(encodedPatternObject.length != null)
		ret.length = encodedPatternObject.length;
	if(encodedPatternObject.time != null)
		ret.time = encodedPatternObject.time;
	else if(!originalPattern || !ret.time)
		ret.time = 4;
	if(encodedPatternObject.upbeat != null)
		ret.upbeat = encodedPatternObject.upbeat;
	else if(!originalPattern || !ret.upbeat)
		ret.upbeat = 0;
	if(encodedPatternObject.volumeHack != null)
		ret.volumeHack = encodedPatternObject.volumeHack;
	if(encodedPatternObject.hideFromSheet != null)
		ret.hideFromSheet = encodedPatternObject.hideFromSheet;
	if(encodedPatternObject.openRepeats != null)
		ret.openRepeats = encodedPatternObject.openRepeats;

	if(ret.length == null)
		throw new Error("No pattern length provided.");

	for(const instr of config.instrumentKeys) {
		const encoded = encodedPatternObject[instr];

		if(encodedPatternObject[instr]) {
			let encoded: string = encodedPatternObject[instr] as string;

			switch(encoded.charAt(0)) {
				case "!":
					encoded = applyDiffString("", encoded.substr(1), ret.length*ret.time + ret.upbeat);
					break;

				case "+":
					if(originalPattern == null)
						throw new Error("Could not apply diff as original pattern does not exist.");

					encoded = applyDiffString(pattern2str(originalPattern[instr], originalPattern.length*originalPattern.time), encoded.substr(1), ret.length*ret.time + ret.upbeat);
					break;

				case '@': {
					const toInstr = encoded.substr(1, 2) as Instrument;
					encoded = applyDiffString(pattern2str(ret[toInstr] || [ ], ret.length*ret.time), encoded.substr(3), ret.length*ret.time + ret.upbeat);
					break;
				}
			}

			ret[instr] = str2pattern(encoded);
		} else if(encoded == "")
			ret[instr] = [ ];
	}

	return normalizePattern(ret);
}

/**
 * Returns a string representation of the given strokes, with one letter per stroke.
 */
function pattern2str(pattern: Array<string>, length: number) {
	// Note: Cannot use pattern.map or pattern.forEach, as it skips undefined values

	let ret = "";
	for(let i=0; i<length; i++) {
		ret += pattern[i] || " ";
	}
	return ret;
}

/**
 * Converts the string representation of the given strokes (as returned by pattern2str) back to an array of strokes.
 */
function str2pattern(string: string): Array<string> {
	return string.split("");
}

/**
 * Sets the stroke at the given position in the given pattern object.
 */
export function updateStroke(pattern: Pattern, instrument: Instrument, i: number, stroke: string): void {
	if(!pattern[instrument])
		pattern[instrument] = [];
	pattern[instrument][i] = stroke;
}

/**
 * A repeated block of bars of a pattern, as detected by the repeat condensation of the condensed pattern
 * representation (structurally compatible with CondensedSegment from ./condensed). Bar 0 is the first bar
 * after the upbeat.
 */
export type PatternSegment = {
	startBar: number;
	bars: number;
	repeat: number;
};

/**
 * Sets the stroke at the given position (a raw index into the stroke array, i.e. including the upbeat strokes)
 * and mirrors it into all other iterations of the given repeated segment. Used by the condensed pattern view,
 * where a repeated block is rendered (and edited) once but represents all its iterations.
 * Positions within the upbeat, or without a repeated segment, are updated as usual.
 */
export function updateStrokeMirrored(pattern: Pattern, instrument: Instrument, i: number, stroke: string, segment?: PatternSegment): void {
	const bodyIndex = i - pattern.upbeat;
	if(!segment || segment.repeat <= 1 || bodyIndex < 0) {
		updateStroke(pattern, instrument, i, stroke);
		return;
	}

	const barStrokes = 4 * pattern.time;
	const unitStrokes = segment.bars * barStrokes;
	const offset = (bodyIndex - segment.startBar * barStrokes) % unitStrokes;
	for(let iteration = 0; iteration < segment.repeat; iteration++) {
		updateStroke(pattern, instrument, pattern.upbeat + segment.startBar * barStrokes + iteration * unitStrokes + offset, stroke);
	}
}

/**
 * Changes how often the given repeated segment is played by appending copies of (or removing iterations of) its
 * repeated unit at the end of the block, adjusting the pattern length accordingly. The stroke indexes of the
 * volume hack and the beat numbers of openRepeats that lie behind the changed region are shifted along so
 * that they keep referring to the same strokes (volume points within a removed region are dropped).
 */
export function setSegmentRepeatCount(pattern: Pattern, segment: PatternSegment, newRepeat: number): void {
	newRepeat = Math.max(1, Math.round(newRepeat));
	if(newRepeat == segment.repeat)
		return;

	const barStrokes = 4 * pattern.time;
	const unitStrokes = segment.bars * barStrokes;
	const unitStart = pattern.upbeat + segment.startBar * barStrokes;
	const blockEnd = unitStart + segment.repeat * unitStrokes;
	const shift = (newRepeat - segment.repeat) * unitStrokes;
	// The first raw stroke index affected by the change: strokes (and volume points) at or behind it are shifted
	const changeStart = Math.min(blockEnd, blockEnd + shift);

	for(const instr of config.instrumentKeys) {
		const strokes = pattern[instr];
		if(!strokes || strokes.length <= unitStart)
			continue;
		if(shift > 0) {
			if(strokes.length < blockEnd)
				strokes.length = blockEnd;
			const copies: string[] = [];
			for(let i = 0; i < shift; i++)
				copies.push(strokes[unitStart + i % unitStrokes]);
			strokes.splice(blockEnd, 0, ...copies);
		} else if(strokes.length > changeStart) {
			strokes.splice(changeStart, -shift);
		}
	}

	if(pattern.volumeHack) {
		for(const instr of Object.keys(pattern.volumeHack) as Instrument[]) {
			const hack = pattern.volumeHack[instr];
			if(!hack)
				continue;
			const updated: AllVolumeHack = {};
			for(const key of Object.keys(hack).map(Number)) {
				if(key < changeStart)
					updated[key] = hack[key];
				else if(key >= blockEnd)
					updated[key + shift] = hack[key];
				// Volume points within a removed iteration are dropped
			}
			pattern.volumeHack[instr] = updated;
		}
	}

	if(pattern.openRepeats) {
		const shiftBeats = (newRepeat - segment.repeat) * segment.bars * 4;
		const changeStartBeat = (changeStart - pattern.upbeat) / pattern.time;
		const blockEndBeat = (blockEnd - pattern.upbeat) / pattern.time;
		pattern.openRepeats = pattern.openRepeats
			.filter((beat) => beat - 1 < changeStartBeat || beat - 1 >= blockEndBeat)
			.map((beat) => (beat - 1 >= blockEndBeat ? beat + shiftBeats : beat));
	}

	pattern.length += (newRepeat - segment.repeat) * segment.bars * 4;
}

/**
 * Sets some properties on the given pattern, adjusting the strokes to preserve as much of the pattern as possible:
 * If the upbeat changes, the strokes are shifted so that everything from the first regular beat on stays in position.
 * If the time (subdivisions) changes, the strokes are stretched/shrunk onto the new grid (anchored at the first
 * regular beat, with the upbeat scaled along), dropping any strokes that do not fall onto the new grid.
 */
export function updatePattern(pattern: Pattern, update: Partial<PatternProperties>): void {
	const oldTime = pattern.time;
	const oldUpbeat = pattern.upbeat;

	Object.assign(pattern, update);

	if(update.time != null && update.time != oldTime) {
		if(update.upbeat == null)
			pattern.upbeat = Math.round(oldUpbeat * pattern.time / oldTime);

		const newLength = pattern.length * pattern.time + pattern.upbeat;
		for(const instr of config.instrumentKeys) {
			const oldStrokes = pattern[instr];
			const newStrokes: Array<string> = [];
			for(let i = 0; i < newLength; i++) {
				// Position of the new stroke relative to the first regular beat, in units of the old grid
				const oldIndex = oldUpbeat + (i - pattern.upbeat) * oldTime / pattern.time;
				newStrokes.push((Number.isInteger(oldIndex) && oldStrokes[oldIndex]) || ' ');
			}
			pattern[instr] = newStrokes;
		}
	} else if(update.upbeat != null && update.upbeat != oldUpbeat) {
		const shift = update.upbeat - oldUpbeat;
		const unshift = [];
		for(let i = 0; i < shift; i++)
			unshift.push(' ');
		const splice = Math.max(0, -shift);

		for(const instr of config.instrumentKeys) {
			pattern[instr].unshift(...unshift);
			pattern[instr].splice(0, splice);
		}
	}
}
