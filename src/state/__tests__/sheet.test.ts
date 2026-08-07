import { describe, expect, test } from "vitest";
import * as z from "zod";
import { CompressedPattern, compressedPatternValidator, patternFromCompressed } from "../pattern";
import { normalizeTune } from "../tune";
import { getSheetPattern, getUsedStrokes } from "../sheet";

function makePattern(compressed: z.input<typeof compressedPatternValidator>) {
	// patternFromCompressed() normalizes its input, so passing the unparsed input form (e.g. a legacy volume hack) is fine
	return patternFromCompressed(compressed as CompressedPattern);
}

describe("getSheetPattern", () => {
	test("omits instruments that do not play anything", () => {
		const sheet = getSheetPattern(makePattern({
			length: 4,
			ls: "X   X   X   X   ",
			ag: "o a o a o a o a "
		}));

		expect(sheet.rows.map((row) => row.instruments)).toEqual([["ls"], ["ag"]]);
		expect(sheet.rows.map((row) => row.label)).toEqual(["instruments", "instruments"]);
	});

	test("merges instruments that play identical lines", () => {
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
			length: 4,
			ls: "X  X  X   X X   ",
			ms: "@ls", hs: "@ls", re: "@ls", sn: "@ls", ta: "@ls", ag: "@ls", sh: "@ls"
		}));

		expect(sheet.rows).toHaveLength(1);
		expect(sheet.rows[0].label).toBe("everybody");
		expect(sheet.rows[0].instruments).toEqual(["ls", "ms", "hs", "re", "sn", "ta", "ag", "sh"]);
	});

	test("labels the dominant group as Everybody else and orders it last", () => {
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
			length: 4,
			ls: "X X X X X X X X ", ms: "@ls", hs: "@ls", re: "@ls",
			sn: "X  X  X   X X   ", ta: "@sn", ag: "@sn", sh: "@sn"
		}));

		expect(sheet.rows.map((row) => row.label)).toEqual(["instruments", "instruments"]);
	});

	test("renders a pattern in which nobody plays as a single silent Everybody row", () => {
		const sheet = getSheetPattern(makePattern({ length: 4 }));

		expect(sheet.rows).toHaveLength(1);
		expect(sheet.rows[0].label).toBe("everybody");
		expect(sheet.rows[0].strokes.every((stroke) => stroke === " ")).toBe(true);
	});

	test("condenses a fully periodic pattern into a single repeated segment", () => {
		const sheet = getSheetPattern(makePattern({
			length: 16,
			ls: "X   X   X   X   ".repeat(4)
		}));

		expect(sheet.totalBars).toBe(4);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 4 }]);
		expect(sheet.dynamics).toBeUndefined();
	});

	test("condenses a repeated two-bar unit", () => {
		const sheet = getSheetPattern(makePattern({
			length: 16,
			ls: ("X   X   X   X   " + "X X X X X X X X ").repeat(2)
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 2, repeat: 2 }]);
	});

	test("condenses leading repeated bars followed by a different bar", () => {
		// Similar to the Karla Break: 3 bars of straight strokes, then a single stroke
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
			length: 16,
			ls: a + a + b + b
		}));

		expect(sheet.segments).toEqual([
			{ startBar: 0, bars: 1, repeat: 2 },
			{ startBar: 2, bars: 1, repeat: 2 }
		]);
	});

	test("does not condense a pattern without repetitions", () => {
		const sheet = getSheetPattern(makePattern({
			length: 12,
			ls: "X   X   X   X   " + "X X X X X X X X " + "XXXXXXXXXXXXXXXX"
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 3, repeat: 1 }]);
	});

	test("does not condense bars whose volumes differ, but condenses a monotonic volume ramp with an annotation", () => {
		// Like the “8 up” break: two identical bars with a crescendo across the whole pattern
		const crescendo: Record<number, number> = {};
		for (let i = 0; i < 32; i++) {
			crescendo[i] = 0.05 + (0.95 / 31) * i;
		}
		const sheet = getSheetPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: crescendo
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
		expect(sheet.dynamics).toBe("crescendo");
	});

	test("condenses periodic volumes without an annotation", () => {
		const sheet = getSheetPattern(makePattern({
			length: 8,
			ls: "X   X   X   X   ".repeat(2),
			volumeHack: { 0: 0.5, 8: 1, 16: 0.5, 24: 1 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
		expect(sheet.dynamics).toBeUndefined();
	});

	test("annotates a decrescendo", () => {
		const sheet = getSheetPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: { 0: 1, 16: 0.5 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
		expect(sheet.dynamics).toBe("decrescendo");
	});

	test("does not condense non-monotonic volume changes", () => {
		const sheet = getSheetPattern(makePattern({
			length: 8,
			ls: "XXXXXXXXXXXXXXXX".repeat(2),
			volumeHack: { 0: 1, 8: 0.2, 16: 0.9, 24: 0.3 }
		}));

		expect(sheet.segments).toEqual([{ startBar: 0, bars: 2, repeat: 1 }]);
		expect(sheet.dynamics).toBeUndefined();
	});

	test("keeps instruments with different volume curves in separate rows", () => {
		const sheet = getSheetPattern(makePattern({
			length: 4,
			ls: "X   X   X   X   ",
			ms: "@ls",
			volumeHack: { ls: { 0: 0.5 } }
		}));

		expect(sheet.rows.map((row) => row.instruments)).toEqual([["ls"], ["ms"]]);
	});

	test("keeps the upbeat out of the repetition detection", () => {
		const sheet = getSheetPattern(makePattern({
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
		const sheet = getSheetPattern(makePattern({
			length: 8,
			time: 3,
			ls: "X  X  X  X  ".repeat(2)
		}));

		expect(sheet.time).toBe(3);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 2 }]);
	});

	test("does not condense patterns whose length is not a multiple of 4 beats", () => {
		const sheet = getSheetPattern(makePattern({
			length: 2,
			ls: "X   X   "
		}));

		expect(sheet.totalBars).toBe(1);
		expect(sheet.segments).toEqual([{ startBar: 0, bars: 1, repeat: 1 }]);
	});
});

describe("getUsedStrokes", () => {
	test("collects the distinct strokes of all patterns in config order", () => {
		const tune = normalizeTune({
			patterns: {
				"Tune": patternFromCompressed({ length: 4, ls: "X 0 s           ", ag: "o a             " }),
				"Break 1": patternFromCompressed({ length: 4, re: "f               " })
			}
		});

		const strokes = getUsedStrokes([tune]);
		expect(strokes).toContain("X");
		expect(strokes).toContain("0");
		expect(strokes).toContain("s");
		expect(strokes).toContain("f");
		expect(strokes).toContain("o");
		expect(strokes).toContain("a");
		expect(strokes).not.toContain("r");
		expect(strokes).not.toContain(" ");
	});
});
