import { describe, expect, test } from "vitest";
import * as z from "zod";
import { CompressedPattern, compressedPatternValidator, patternFromCompressed } from "../pattern";
import { getCondensedPattern } from "../condensed";

function makePattern(compressed: z.input<typeof compressedPatternValidator>) {
	// patternFromCompressed() normalizes its input, so passing the unparsed input form (e.g. a legacy volume hack) is fine
	return patternFromCompressed(compressed as CompressedPattern);
}

describe("getCondensedPattern", () => {
	test("omits instruments that do not play anything", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X   X   X   X   ",
			ag: "o a o a o a o a "
		}));

		expect(sheet.rows.map((row) => row.instruments)).toEqual([["ls"], ["ag"]]);
		expect(sheet.rows.map((row) => row.label)).toEqual(["instruments", "instruments"]);
	});

	test("merges instruments that play identical lines", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X   X   X   X   ",
			ms: "@ls",
			hs: "@ls",
			sn: "X X X X X X X X "
		}));

		expect(sheet.rows.map((row) => row.instruments)).toEqual([["ls", "ms", "hs"], ["sn"]]);
		expect(sheet.rows.map((row) => row.label)).toEqual(["instruments", "instruments"]);
	});

	test("labels a single row covering enough instruments as Everybody", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X  X  X   X X   ",
			ms: "@ls", hs: "@ls", re: "@ls", sn: "@ls", ta: "@ls", ag: "@ls", sh: "@ls"
		}));

		expect(sheet.rows).toHaveLength(1);
		expect(sheet.rows[0].label).toBe("everybody");
		expect(sheet.rows[0].instruments).toEqual(["ls", "ms", "hs", "re", "sn", "ta", "ag", "sh"]);
	});

	test("labels the dominant group as Everybody else and orders it last", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X X X X X X X X ",
			ms: "@ls", hs: "@ls", sn: "@ls", ta: "@ls", ag: "@ls", sh: "@ls",
			re: "X  X  X   X X   "
		}));

		expect(sheet.rows).toHaveLength(2);
		expect(sheet.rows[0].label).toBe("instruments");
		expect(sheet.rows[0].instruments).toEqual(["re"]);
		expect(sheet.rows[1].label).toBe("everybody-else");
		expect(sheet.rows[1].instruments).toEqual(["ls", "ms", "hs", "sn", "ta", "ag", "sh"]);
	});

	test("does not use Everybody else labels when groups have similar sizes", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X X X X X X X X ", ms: "@ls", hs: "@ls", re: "@ls",
			sn: "X  X  X   X X   ", ta: "@sn", ag: "@sn", sh: "@sn"
		}));

		expect(sheet.rows.map((row) => row.label)).toEqual(["instruments", "instruments"]);
	});

	test("renders a pattern in which nobody plays as a single silent Everybody row", () => {
		const sheet = getCondensedPattern(makePattern({ length: 4 }));

		expect(sheet.rows).toHaveLength(1);
		expect(sheet.rows[0].label).toBe("everybody");
		expect(sheet.rows[0].strokes.every((stroke) => stroke === " ")).toBe(true);
	});

	test("condenses a fully periodic pattern into a single repeated segment", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 16,
			ls: "X   X   X   X   ".repeat(4)
		}));

		expect(sheet.totalBars).toBe(4);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 4 }]);
	});

	test("condenses a repeated two-bar unit", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 16,
			ls: ("X   X   X   X   " + "X X X X X X X X ").repeat(2)
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 2, repeat: 2 }]);
	});

	test("condenses leading repeated bars followed by a different bar", () => {
		// Similar to the Karla Break: 3 bars of straight strokes, then a single stroke
		const sheet = getCondensedPattern(makePattern({
			length: 16,
			ls: "XXXXXXXXXXXXXXXX".repeat(3) + "X               "
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 3 },
			{ startBar: 3, bars: 1, repeat: 1 }
		]);
	});

	test("condenses a repeated multi-bar unit followed by a different bar", () => {
		// Like a 3-bar phrase played twice with a closing bar
		const unit = "X   X   X   X   " + "X X X X X X X X " + "X  X  X   X X   ";
		const sheet = getCondensedPattern(makePattern({
			length: 28,
			ls: unit.repeat(2) + "X               "
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 3, repeat: 2 },
			{ startBar: 6, bars: 1, repeat: 1 }
		]);
	});

	test("condenses a repeated multi-bar unit in the middle of a pattern", () => {
		const a = "X   X   X   X   ";
		const b = "X X X X X X X X ";
		const c = "X  X  X   X X   ";
		const sheet = getCondensedPattern(makePattern({
			length: 24,
			ls: c + a + b + a + b + c
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 2, repeat: 2 },
			{ startBar: 5, bars: 1, repeat: 1 }
		]);
	});

	test("condenses two adjacent repeated blocks separately", () => {
		const a = "X   X   X   X   ";
		const b = "X X X X X X X X ";
		const sheet = getCondensedPattern(makePattern({
			length: 16,
			ls: a + a + b + b
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 2 },
			{ startBar: 2, bars: 1, repeat: 2 }
		]);
	});

	test("does not condense a pattern without repetitions", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX"
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 3, repeat: 1 }]);
	});

	test("condenses a monotonic volume ramp with a crescendo annotation on the segment", () => {
		// Like the “8 up” break: two identical bars with a crescendo across the whole pattern
		const crescendo: Record<number, number> = {};
		for (let i = 0; i < 32; i++) {
			crescendo[i] = 0.05 + (0.95 / 31) * i;
		}
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: crescendo
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2, dynamics: "crescendo" }]);
	});

	test("condenses periodic volumes without an annotation", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X   X   X   X   ".repeat(2),
			volumeHack: { 0: 0.5, 8: 1, 16: 0.5, 24: 1 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
	});

	test("annotates a decrescendo", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: { 0: 1, 16: 0.5 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2, dynamics: "decrescendo" }]);
	});

	test("condenses a volume ramp in the middle of a pattern with an annotation on its segment", () => {
		// Like the Afro Call: 2 identical loud bars, 2 identical bars ramping up, then a different bar
		const sheet = getCondensedPattern(makePattern({
			length: 20,
			ls: "X   X   X   X   ".repeat(2) + "X X X X X X X X ".repeat(2) + "X               ",
			volumeHack: { 32: 0.25, 48: 0.5, 64: 1 }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 2 },
			{ startBar: 2, bars: 1, repeat: 2, dynamics: "crescendo" },
			{ startBar: 4, bars: 1, repeat: 1 }
		]);
	});

	test("condenses a fading block even when the volume jumps back up afterwards", () => {
		// Like the Avenida Call Front: 4 bars fading out step by step, then a final loud bar
		const sheet = getCondensedPattern(makePattern({
			length: 20,
			ls: "X   X   X   X   ".repeat(4) + "X               ",
			volumeHack: { 0: 1, 16: 0.75, 32: 0.5, 48: 0.25, 64: 1 }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 4, dynamics: "decrescendo" },
			{ startBar: 4, bars: 1, repeat: 1 }
		]);
	});

	test("ignores volume changes during silent strokes", () => {
		// The volume change at stroke 4 only affects silent strokes of the first bar and is inaudible
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X       X       ".repeat(2),
			volumeHack: { 4: 0.5, 8: 1 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
	});

	test("does not condense non-monotonic volume changes", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: { 0: 1, 8: 0.2, 16: 0.9, 24: 0.3 }
		}));

		// The bars are not condensed; each bar fades on its own, so each gets its own annotation
		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1, dynamics: "decrescendo" },
			{ startBar: 1, bars: 1, repeat: 1, dynamics: "decrescendo" }
		]);
	});

	test("keeps instruments with different volume curves in separate rows", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 4,
			ls: "X   X   X   X   ",
			ms: "@ls",
			volumeHack: { ls: { 0: 0.5 } }
		}));

		expect(sheet.rows.map((row) => row.instruments)).toEqual([["ls"], ["ms"]]);
	});

	test("keeps the upbeat out of the repetition detection", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			upbeat: 2,
			ls: "XX" + "X   X   X   X   ".repeat(2)
		}));

		expect(sheet.upbeat).toBe(2);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
		// The upbeat strokes are part of the row strokes and precede bar 0
		expect(sheet.rows[0].strokes.slice(0, 2)).toEqual(["X", "X"]);
	});

	test("supports ternary time signatures", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			time: 3,
			ls: "X  X  X  X  ".repeat(2)
		}));

		expect(sheet.time).toBe(3);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
	});

	test("marks repeated blocks listed in openRepeats as open-ended", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X ".repeat(2),
			openRepeats: [5]
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 2, open: true }
		]);
	});

	test("turns a single bar into an open-ended repeat block when no repetition is detected there", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X               " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX",
			openRepeats: [5]
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 1, open: true },
			{ startBar: 2, bars: 1, repeat: 1 }
		]);
	});

	test("turns the first bar into an open-ended repeat block when no repetition is detected there", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X               " + "X X X X X X X X ",
			openRepeats: [1]
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1, open: true },
			{ startBar: 1, bars: 1, repeat: 1 }
		]);
	});

	test("re-anchors the repetition detection at a openRepeats beat", () => {
		// Greedily, the a-b unit would be detected as repeating 3 times from bar 1; the open repeat at bar 3
		// forces the detection to re-anchor there, so the phase starting at bar 3 is detected instead
		const a = "X   X   X   X   ";
		const b = "X X X X X X X X ";
		const sheet = getCondensedPattern(makePattern({
			length: 28,
			ls: "XXXXXXXXXXXXXXXX" + a + b + a + b + a + b,
			openRepeats: [13]
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 3, repeat: 1 },
			{ startBar: 3, bars: 2, repeat: 2, open: true }
		]);
	});

	test("treats repetitions with volume changes during their leading silence as identical and annotates the level", () => {
		// Like the Levada Break Pequenyo: a loud intro bar, then a soft repeated block whose bars start with
		// silence. The change to soft happens during the silence, so the repetitions sound identical (they are
		// not a fade) and the whole block is annotated as soft.
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "XXXXXXXXXXXXXXXX" + "    X   X   X   ".repeat(2),
			volumeHack: { 16: 0.3 },
			openRepeats: [5]
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 2, open: true, volume: "soft" }
		]);
	});

	test("annotates a soft section by splitting it out of a non-repeated segment", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX",
			volumeHack: { 16: 0.5, 32: 1 }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 1, volume: "soft" },
			{ startBar: 2, bars: 1, repeat: 1 }
		]);
	});

	test("annotates a volume ramp above the bars where it happens", () => {
		// Like the Levada Break 3: the crescendo happens within the first bar, the second bar stays loud
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX" + "X X X X X X X X ",
			volumeHack: { 0: 0.3, 4: 0.6, 8: 0.8, 12: 1 }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1, dynamics: "crescendo" },
			{ startBar: 1, bars: 1, repeat: 1 }
		]);
	});

	test("records the instruments that a volume annotation applies to", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX",
			ag: "o a o a o a o a ".repeat(3),
			volumeHack: { ag: { 16: 0.5, 32: 1 } }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 1, volume: "soft", annotationInstruments: ["ag"] },
			{ startBar: 2, bars: 1, repeat: 1 }
		]);
	});

	test("keeps adjacent soft sections apart when they affect different instruments", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX",
			ag: "o a o a o a o a ".repeat(3),
			volumeHack: { ls: { 16: 0.5 }, ag: { 16: 0.5, 32: 1 } }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1 },
			{ startBar: 1, bars: 1, repeat: 1, volume: "soft" },
			{ startBar: 2, bars: 1, repeat: 1, volume: "soft", annotationInstruments: ["ls"] }
		]);
	});

	test("records the instruments that a repeated block's ramp annotation applies to", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X   X   X   X   ".repeat(2),
			ag: "o a o a o a o a ".repeat(2),
			volumeHack: { ag: { 0: 0.5, 16: 1 } }
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 2, dynamics: "crescendo", annotationInstruments: ["ag"] }
		]);
	});

	test("does not annotate volumes of rows that never change", () => {
		// A constant per-instrument volume is a mix balance, not a volume indication for the players
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X   X   X   X   " + "X X X X X X X X ",
			ag: "o a o a o a o a ".repeat(2),
			volumeHack: { ag: { 0: 0.5 } }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 2, repeat: 1 }]);
	});

	test("ignores openRepeats beats that do not fall on a bar start", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 8,
			ls: "X               " + "X X X X X X X X ",
			openRepeats: [6, 99]
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 2, repeat: 1 }]);
	});

	test("does not condense patterns whose length is not a multiple of 4 beats", () => {
		const sheet = getCondensedPattern(makePattern({
			length: 2,
			ls: "X   X   "
		}));

		expect(sheet.totalBars).toBe(1);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 1 }]);
	});

	test("skips the repeat detection (but keeps the volume annotations) with condense: false", () => {
		const pattern = makePattern({
			length: 8,
			ls: "X X X X X X X X X X X X X X X X ",
			volumeHack: { 0: 0.4, 16: 1 },
			openRepeats: [1]
		});

		expect(getCondensedPattern(pattern).segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 2, dynamics: "crescendo", open: true }
		]);

		expect(getCondensedPattern(pattern, { condense: false }).segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 1, volume: "soft" },
			{ startBar: 1, bars: 1, repeat: 1 }
		]);
	});
});
