import { describe, expect, test, vi } from "vitest";

// The player module registers the instrument samples with beatbox.js at import time, which needs a browser
// audio stack — both are irrelevant for testing the raw pattern conversion, so they are mocked away.
vi.mock("virtual:audioFiles", () => ({ default: {} }));
vi.mock("beatbox.js", () => ({ default: class MockBeatbox {} }));

import { patternToBeatbox, songToBeatbox } from "../player";
import { normalizePattern } from "../../state/pattern";
import { normalizePlaybackSettings } from "../../state/playbackSettings";
import type { State } from "../../state/state";
import type { SongParts } from "../../state/song";
import config from "../../config";

/** A line with one stroke on each beat start (time signature 4). */
function strokesOnBeats(beats: number): string[] {
	return Array.from({ length: beats * 4 }, (_, i) => (i % 4 === 0 ? "X" : " "));
}

// Like the Levada Break Macaco: a pattern of unusual length that halves the tempo from its start
const slow = normalizePattern({ length: 14, speed: 100, speedHack: { 1: -50 }, ls: strokesOnBeats(14) });
const next = normalizePattern({ length: 4, speed: 100, ls: strokesOnBeats(4) });

const state = { tunes: { T: { patterns: { Slow: slow, Next: next } } } } as unknown as State;

/** The slots of the raw pattern that contain an ls stroke. */
function getStrokeSlots(raw: ReturnType<typeof songToBeatbox>): number[] {
	const slots: number[] = [];
	raw.forEach((strokes, i) => {
		if (strokes && strokes.some((stroke) => typeof stroke !== "string" && stroke.instrument === "ls_X")) {
			slots.push(i);
		}
	});
	return slots;
}

describe("patternToBeatbox", () => {
	test("bakes the speed hack into the raw pattern unless disabled", () => {
		const baked = patternToBeatbox(slow, normalizePlaybackSettings({}));
		expect(baked.tempoMap).toBeDefined();
		expect(baked.length).toBe(14 * config.playTime * 2);

		const unbaked = patternToBeatbox(slow, normalizePlaybackSettings({}), false);
		expect(unbaked.tempoMap).toBeUndefined();
		expect(unbaked.length).toBe(14 * config.playTime);
		expect(getStrokeSlots(unbaked)).toEqual(Array.from({ length: 14 }, (_, beat) => beat * config.playTime));
	});
});

describe("songToBeatbox", () => {
	test("applies a pattern's speed hack exactly once across the whole song", () => {
		// Regression test: the speed hack used to be baked into the pattern by insertPattern() and then
		// applied again over the assembled song, so the slowed pattern was stretched twice (with its tail cut
		// off by the copy window) and the following pattern started before it musically ended.
		const song = { 0: { ls: ["T", "Slow"] }, 14: { ls: ["T", "Next"] } } as SongParts;
		const raw = songToBeatbox(song, state, normalizePlaybackSettings({}));

		expect(raw.tempoMap).toBeDefined();
		// The slowed pattern takes twice the time; the following pattern starts exactly at its stretched end
		// and keeps playing at the changed tempo
		expect(getStrokeSlots(raw)).toEqual(Array.from({ length: 14 + 4 }, (_, beat) => beat * 2 * config.playTime));
	});
});
