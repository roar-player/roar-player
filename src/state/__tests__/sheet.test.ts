import { describe, expect, test } from "vitest";
import { patternFromCompressed } from "../pattern";
import { normalizeTune } from "../tune";
import { getUsedStrokes, tuneHasSheet } from "../sheet";

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

	test("ignores patterns that are hidden from the sheet", () => {
		const tune = normalizeTune({
			patterns: {
				"Tune": patternFromCompressed({ length: 4, ls: "X               " }),
				"Hidden": patternFromCompressed({ length: 4, re: "f               ", hideFromSheet: true })
			}
		});

		expect(getUsedStrokes([tune])).toEqual(["X"]);
	});
});

describe("tuneHasSheet", () => {
	test("is false only when all patterns are hidden", () => {
		const visible = patternFromCompressed({ length: 4, ls: "X               " });
		const hidden = patternFromCompressed({ length: 4, ls: "X               ", hideFromSheet: true });

		expect(tuneHasSheet(normalizeTune({ patterns: { "A": visible, "B": hidden } }))).toBe(true);
		expect(tuneHasSheet(normalizeTune({ patterns: { "B": hidden } }))).toBe(false);
	});
});
