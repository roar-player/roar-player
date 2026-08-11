import { expect, test } from "vitest";
import { normalizePattern, setSegmentRepeatCount, updateStrokeMirrored } from "../pattern";

test('normalizePattern', () => {
	expect(normalizePattern()).toEqual({
		length: 4,
		time: 4,
		speed: 100,
		upbeat: 0,
		loop: false,
		ls: [],
		ms: [],
		hs: [],
		re: [],
		sn: [],
		ta: [],
		ag: [],
		sh: [],
		ot: []
	});

	// Test legacy volume hack
	expect(normalizePattern({
		volumeHack: { 1: 0.1, 2: 0.2 }
	})).toMatchObject({
		volumeHack: {
			ls: { 1: 0.1, 2: 0.2 },
			ms: { 1: 0.1, 2: 0.2 },
			hs: { 1: 0.1, 2: 0.2 },
			re: { 1: 0.1, 2: 0.2 },
			sn: { 1: 0.1, 2: 0.2 },
			ta: { 1: 0.1, 2: 0.2 },
			ag: { 1: 0.1, 2: 0.2 },
			sh: { 1: 0.1, 2: 0.2 },
			ot: { 1: 0.1, 2: 0.2 }
		}
	});
});

test('updateStrokeMirrored', () => {
	const bar = "X   o   X   o   ";
	const pattern = normalizePattern({
		length: 8,
		upbeat: 2,
		ls: ("oo" + bar + bar).split("")
	});
	const segment = { startBar: 0, bars: 1, repeat: 2 };

	// A stroke inside a repeated block is written to all iterations
	updateStrokeMirrored(pattern, "ls", 2 + 4, "r", segment);
	expect(pattern.ls.join("")).toBe("oo" + "X   r   X   o   " + "X   r   X   o   ");

	// Upbeat strokes are not mirrored
	updateStrokeMirrored(pattern, "ls", 1, "X", segment);
	expect(pattern.ls.join("")).toBe("oX" + "X   r   X   o   " + "X   r   X   o   ");

	// Without a segment, only the given stroke is written
	updateStrokeMirrored(pattern, "ls", 2 + 4, "o", undefined);
	expect(pattern.ls.join("")).toBe("oX" + "X   o   X   o   " + "X   r   X   o   ");
});

test('setSegmentRepeatCount', () => {
	const bar = "X   o   X   o   ";
	const pattern = normalizePattern({
		length: 8,
		ls: (bar + bar).split(""),
		volumeHack: { ls: { 0: 0.5, 32: 1 } },
		openRepeats: [1, 9]
	});

	// Adding an iteration appends a copy of the repeated unit and shifts later volume points and open-repeat beats
	setSegmentRepeatCount(pattern, { startBar: 0, bars: 1, repeat: 2 }, 3);
	expect(pattern.length).toBe(12);
	expect(pattern.ls.join("")).toBe(bar + bar + bar);
	expect(pattern.volumeHack).toEqual({ ls: { 0: 0.5, 48: 1 } });
	expect(pattern.openRepeats).toEqual([1, 13]);

	// Removing iterations drops the strokes (and volume points) of the removed region and shifts the rest back
	setSegmentRepeatCount(pattern, { startBar: 0, bars: 1, repeat: 3 }, 1);
	expect(pattern.length).toBe(4);
	expect(pattern.ls.join("")).toBe(bar);
	expect(pattern.volumeHack).toEqual({ ls: { 0: 0.5, 16: 1 } });
	expect(pattern.openRepeats).toEqual([1, 5]);
});
