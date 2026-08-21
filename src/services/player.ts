import { inflateRaw } from "pako";
import Beatbox, { InstrumentReferenceObject, Pattern as RawPattern } from "beatbox.js";
import audioFiles from "virtual:audioFiles";
import config, { Instrument } from "../config";
import { Headphones, Mute, normalizePlaybackSettings, PlaybackSettings, Whistle } from "../state/playbackSettings";
import { normalizePattern, Pattern } from "../state/pattern";
import { getPatternFromState, State } from "../state/state";
import { getEffectiveSongLength, SongParts } from "../state/song";
import { decode } from "base64-arraybuffer";
import { computed, ComputedRef, reactive } from "vue";
import { isEqual } from "lodash-es";
import { clone } from "../utils";
import { buildTempoMap, gridToReal, realToGrid, resamplePattern, TempoMapSegment, TempoMark } from "./tempo";

export interface BeatboxReference {
	id: number;
	playing: boolean;
	customPosition: boolean;
}

export interface RawPatternWithUpbeat extends RawPattern {
	upbeat: number;
	/**
	 * Set if the pattern contains tempo changes (through the speed hack, see src/services/tempo.ts): the
	 * mapping between the positions of the resampled pattern and the musical grid of config.playTime slots
	 * per beat. Use rawPositionToBeat()/beatToRawPosition() to convert.
	 */
	tempoMap?: TempoMapSegment[];
}

/** Converts a raw position of the given pattern (as returned by Beatbox.getPosition()) to a beat number (0 = first regular beat). */
export function rawPositionToBeat(position: number, rawPattern: RawPatternWithUpbeat): number {
	const grid = rawPattern.tempoMap ? realToGrid(rawPattern.tempoMap, position) : position;
	return (grid - rawPattern.upbeat) / config.playTime;
}

/** Converts a beat number (0 = first regular beat, can be fractional) to a raw position of the given pattern. */
export function beatToRawPosition(beat: number, rawPattern: RawPatternWithUpbeat): number {
	const grid = beat * config.playTime + rawPattern.upbeat;
	return rawPattern.tempoMap ? gridToReal(rawPattern.tempoMap, grid) : grid;
}

/** The speed factor that a speed hack delta (in bpm relative to the given base speed) corresponds to. */
function getSpeedFactor(baseSpeed: number, delta: number): number {
	return Math.max(0.1, (baseSpeed + delta) / baseSpeed);
}

/** Bakes the given tempo marks into the raw pattern by resampling it (see src/services/tempo.ts). */
function applyTempoMarks(raw: RawPatternWithUpbeat, marks: TempoMark[]): RawPatternWithUpbeat {
	const tempoMap = buildTempoMap(marks);
	if (!tempoMap) {
		return raw;
	}
	return Object.assign(resamplePattern(raw, tempoMap), {
		upbeat: raw.upbeat,
		tempoMap
	});
}

for(const i in audioFiles) {
	// The stroke sounds live in assets/instruments/<instrument>/<hex code of the stroke character>.mp3
	const m = i.match(/^instruments\/([^/]+)\/([a-f0-9]+)\.mp3$/i);
	if (!m) {
		// eslint-disable-next-line no-console
		console.warn(`Unexpected audio file name: ${i}`);
		continue;
	}

	const decompressed = inflateRaw(new Uint8Array(decode(audioFiles[i])));
	void Beatbox.registerInstrument(`${m[1]}_${String.fromCodePoint(parseInt(m[2], 16))}`, decompressed.buffer as ArrayBuffer);
}

let currentNumber = 0;

const players: {
	[id: number]: Beatbox;
} = { };

declare module "beatbox.js" {
	interface BeatboxEvents {
		setPosition: [];
	}
}

class CustomBeatbox extends Beatbox {
	setPosition(position: number) {
		super.setPosition(position);
		this.emit("setPosition");
	}
}

export function createBeatbox(repeat: boolean): BeatboxReference {
	const reference: BeatboxReference = reactive({
		id: currentNumber++,
		playing: false,
		customPosition: false
	});

	const player = new CustomBeatbox([ ], 1, repeat);
	player.on("play", () => {
		reference.playing = true;
		reference.customPosition = true;
	});
	player.on("stop", () => {
		reference.playing = false;
		reference.customPosition = player._position != 0;
	});
	player.on("setPosition", () => {
		reference.customPosition = reference.playing || player._position != 0
	});
	players[reference.id] = player;

	return reference;
}

function isEnabled(instr: Instrument, headphones: Headphones, mute: Mute) {
	if(mute[instr])
		return false;

	if(headphones && headphones.length > 0)
		return headphones.includes(instr);

	return true;
}

/**
 * The playback settings that influence the result of patternToBeatbox()/songToBeatbox(), as a stable value:
 * the same object keeps being returned until one of them changes, so that computeds deriving raw patterns from
 * it are not re-evaluated (Vue skips dependents when a computed returns an identical value). In particular the
 * speed is not part of the raw patterns (it is applied through Beatbox.setBeatLength() instead) — so dragging
 * the speed slider does not rebuild the raw pattern of every player on the page on every input event.
 */
export function rawPatternPlaybackSettings(getSettings: () => PlaybackSettings): ComputedRef<PlaybackSettings> {
	let last: PlaybackSettings | undefined;
	return computed(() => {
		const settings = getSettings();
		if (!last || !isEqual({ ...last, speed: settings.speed }, settings)) {
			last = clone(settings);
		}
		return last;
	});
}

/**
 * Converts a pattern to a raw beatbox pattern.
 * @param applySpeedHack Whether the tempo changes of the pattern's speed hack are baked into the result.
 *     songToBeatbox() passes false here: a speed hack affects the whole rest of the song, so it collects the
 *     tempo changes of all its patterns and applies them once over the assembled song — baking them into the
 *     individual patterns too would resample their strokes twice and misalign them against the other patterns.
 */
export function patternToBeatbox(pattern: Pattern, playbackSettings: PlaybackSettings, applySpeedHack: boolean = true): RawPatternWithUpbeat {
	const fac = config.playTime/pattern.time;
	const ret: RawPattern = new Array((pattern.length*pattern.time + pattern.upbeat) * fac);

	let vol = { } as Record<Instrument, number>;
	for (const instr of config.instrumentKeys) {
		vol[instr] = 1;
	}

	for(let i=0; i<pattern.length*pattern.time+pattern.upbeat; i++) {
		if (pattern.volumeHack) {
			for (const instr of Object.keys(pattern.volumeHack) as Instrument[]) {
				if (pattern.volumeHack[instr] && pattern.volumeHack[instr]![i] != null)
					vol[instr] = pattern.volumeHack[instr]![i];
			}
		}

		const stroke = [ ];

		if(playbackSettings.whistle && i >= pattern.upbeat && (i-pattern.upbeat) % (4*pattern.time) == 0)
			stroke.push({ instrument: playbackSettings.whistle == 2 ? "ot_y" : "ot_w", volume: playbackSettings.volume});
		else if(playbackSettings.whistle == 2 && i >= pattern.upbeat && (i-pattern.upbeat) % pattern.time == 0)
			stroke.push({ instrument: "ot_w", volume: playbackSettings.volume});

		for(const instr of config.instrumentKeys) {
			if(isEnabled(instr, playbackSettings.headphones, playbackSettings.mute) && pattern[instr]) {
				let strokeType = pattern[instr][i];

				if(playbackSettings.loop) {
					// Put upbeat at the end of pattern

					let upbeatStart = pattern[instr].slice(0, pattern.upbeat).findIndex((stroke) => (stroke && stroke != " "));
					if(upbeatStart != -1 && i >= pattern.length * pattern.time + upbeatStart)
						strokeType = pattern[instr][i - pattern.length * pattern.time];
				}

				if(strokeType && strokeType != " ")
					stroke.push({ instrument: instr+"_"+strokeType, volume: vol[instr] * playbackSettings.volume * (playbackSettings.volumes[instr] == null ? 1 : playbackSettings.volumes[instr]) });
			}
		}

		ret[i*fac] = stroke;
	}

	const marks: TempoMark[] = applySpeedHack ? Object.keys(pattern.speedHack ?? {}).map(Number).map((beat) => ({
		slot: pattern.upbeat * fac + (beat - 1) * config.playTime,
		factor: getSpeedFactor(pattern.speed, pattern.speedHack![beat])
	})) : [];

	return applyTempoMarks(Object.assign(ret, {
		upbeat: pattern.upbeat * fac
	}), marks);
}

export function songToBeatbox(song: SongParts, state: State, playbackSettings: PlaybackSettings): RawPatternWithUpbeat {
	const length = getEffectiveSongLength(song, state);
	let maxUpbeat = config.playTime*4;
	let ret: RawPattern = new Array(maxUpbeat + length*config.playTime);
	let upbeat = 0;

	function insertPattern(idx: number, pattern: Pattern, instrumentKey: Instrument, patternLength: number, whistle: Whistle) {
		let patternBeatbox = patternToBeatbox(pattern, normalizePlaybackSettings({
			headphones: [ instrumentKey ],
			volume: playbackSettings.volume,
			volumes: playbackSettings.volumes,
			whistle
		}), false);

		let upbeatHasStarted = false;
		let idxOffset = pattern.upbeat * config.playTime / pattern.time;
		idx = idx*config.playTime;
		for(let i = 0; i<(patternLength*config.playTime + idxOffset); i++) {
			if((patternBeatbox[i] || []).length > 0)
				upbeatHasStarted = true;

			upbeat = Math.max(upbeat, idxOffset - idx - i);

			let existingStrokes = (ret[maxUpbeat + idx + i - idxOffset] || [ ]);
			if(upbeatHasStarted && i - idxOffset < 0)
				existingStrokes = existingStrokes.filter((instr) => ((instr as InstrumentReferenceObject).instrument.split("_", 2)[0] != instrumentKey));
			ret[maxUpbeat + idx + i - idxOffset] = existingStrokes.concat(patternBeatbox[i] || [ ]);
		}
	}

	// Collect the tempo changes (through the speed hacks of the referenced patterns) of the whole song. A speed
	// hack point stays in effect until the next one, also across the following patterns. This is independent of
	// muted/headphoned instruments (muting an instrument does not change the tempo of the song); when several
	// simultaneous patterns define a speed hack for the same beat, the first instrument (in the order of
	// config.instrumentKeys) wins. The slots are relative to song beat 0 (the song upbeat is added below, once
	// it is known).
	type SpeedHackPoint = {
		slot: number;
		/** The slot at which the pattern that defines this point starts. */
		entry: number;
		/** The bpm delta of the speed hack point, relative to the tempo at the pattern's entry. */
		value: number;
		/** The base speed of the pattern, defining the bpm scale of the value. */
		speed: number;
	};
	const speedHackPoints: SpeedHackPoint[] = [];
	const speedHackSlots = new Set<number>();
	for(let i=0; i<length; i++) {
		for(const inst of config.instrumentKeys) {
			const patternReference = song[i] && song[i][inst];
			const pattern = patternReference && getPatternFromState(state, patternReference);
			if(!pattern || !pattern.speedHack)
				continue;

			let patternLength = 1;
			for(let j=i+1; j<i+pattern.length && (!song[j] || !song[j][inst]); j++) // Check if pattern is cut off
				patternLength++;

			for(const beat of Object.keys(pattern.speedHack).map(Number)) {
				if(beat - 1 >= patternLength)
					continue; // The speed hack point lies within the cut-off part of the pattern

				const slot = (i + beat - 1) * config.playTime;
				if(!speedHackSlots.has(slot)) {
					speedHackSlots.add(slot);
					speedHackPoints.push({ slot, entry: i * config.playTime, value: pattern.speedHack[beat], speed: pattern.speed });
				}
			}
		}
	}

	// A speed hack value is relative to the tempo at which its pattern was entered, so that speed changes
	// accumulate across the patterns of a song (a pattern that speeds up by 10 bpm does so from the prevailing
	// tempo, not from the base speed). The points are processed in slot order, so the factor prevailing at a
	// pattern's entry is known by the time its first point is reached (a pattern's points never lie before its
	// entry).
	speedHackPoints.sort((a, b) => a.slot - b.slot);
	const tempoMarks: TempoMark[] = [];
	const entryFactors = new Map<number, number>();
	for(const point of speedHackPoints) {
		let entryFactor = entryFactors.get(point.entry);
		if(entryFactor == null) {
			entryFactor = 1;
			for(const mark of tempoMarks) {
				if(mark.slot < point.entry)
					entryFactor = mark.factor;
			}
			entryFactors.set(point.entry, entryFactor);
		}
		tempoMarks.push({ slot: point.slot, factor: Math.max(0.1, entryFactor + point.value / point.speed) });
	}

	for(let i=0; i<length; i++) {
		for(const inst of config.instrumentKeys) {
			if(isEnabled(inst, playbackSettings.headphones, playbackSettings.mute) && song[i] && song[i][inst]) {
				const patternReference = song[i][inst];
				const pattern = patternReference && getPatternFromState(state, patternReference);
				if(pattern) {
					let patternLength = 1;
					for(let j=i+1; j<i+pattern.length && (!song[j] || !song[j][inst]); j++) // Check if pattern is cut off
						patternLength++;

					insertPattern(i, pattern, inst, patternLength, false);
				}
			}
		}

		if(playbackSettings.whistle) {
			insertPattern(i, normalizePattern({
				length: 4,
				time: 1,
				upbeat: 0,
				ot: [ ' ', ' ', ' ', ' ' ]
			}), "ot", 1, playbackSettings.whistle);
		}
	}

	return applyTempoMarks(Object.assign(ret.slice(maxUpbeat - upbeat), {
		upbeat
	}), tempoMarks.map((mark) => ({ slot: mark.slot + upbeat, factor: mark.factor })));
}

export function stopAllPlayers(): void {
	for(const id of Object.keys(players) as unknown as number[]) {
		void players[id].stop();
	}
}

export function getPlayerById(id: number): Beatbox {
	return players[id] || null;
}
