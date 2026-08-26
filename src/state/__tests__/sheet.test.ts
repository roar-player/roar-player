import { describe, expect, test } from "vitest";
import { patternFromCompressed } from "../pattern";
import { normalizeTune } from "../tune";
import { getBookletPdfLanguage, getSheetPdfLanguage, getUsedStrokes, SHEET_FALLBACK_LANGUAGE, tuneHasSheet } from "../sheet";

describe("getUsedStrokes", () => {
	test("collects the distinct instrument/stroke combinations of all patterns", () => {
		const tune = normalizeTune({
			patterns: {
				"Tune": patternFromCompressed({ length: 4, ls: "X 0 s           ", ag: "o a             " }),
				"Break 1": patternFromCompressed({ length: 4, re: "f               " })
			}
		});

		const strokes = getUsedStrokes([tune]);
		expect(strokes).toContainEqual({ instrument: "ls", stroke: "X" });
		expect(strokes).toContainEqual({ instrument: "ls", stroke: "0" });
		expect(strokes).toContainEqual({ instrument: "ls", stroke: "s" });
		expect(strokes).toContainEqual({ instrument: "re", stroke: "f" });
		expect(strokes).toContainEqual({ instrument: "ag", stroke: "o" });
		expect(strokes).toContainEqual({ instrument: "ag", stroke: "a" });
		expect(strokes.filter((entry) => entry.stroke === "r")).toEqual([]);
		expect(strokes.filter((entry) => entry.stroke === " ")).toEqual([]);
	});

	test("ignores patterns that are hidden from the sheet", () => {
		const tune = normalizeTune({
			patterns: {
				"Tune": patternFromCompressed({ length: 4, ls: "X               " }),
				"Hidden": patternFromCompressed({ length: 4, re: "f               ", hideFromSheet: true })
			}
		});

		expect(getUsedStrokes([tune])).toEqual([{ instrument: "ls", stroke: "X" }]);
	});
});

describe("getSheetPdfLanguage", () => {
	test("returns the requested language for tunes with a description in it", () => {
		// Afoxe has a description in all app languages (assets/tunes/afoxe/)
		expect(getSheetPdfLanguage("Afoxe", "de")).toBe("de");
		expect(getSheetPdfLanguage("Afoxe", SHEET_FALLBACK_LANGUAGE)).toBe(SHEET_FALLBACK_LANGUAGE);
	});

	test("falls back for tunes without a description in the requested language", () => {
		// General Breaks has no descriptions at all (assets/tunes/general-breaks/)
		expect(getSheetPdfLanguage("General Breaks", "de")).toBe(SHEET_FALLBACK_LANGUAGE);
		// The fallback-language sheet is always generated, even without a description
		expect(getSheetPdfLanguage("General Breaks", SHEET_FALLBACK_LANGUAGE)).toBe(SHEET_FALLBACK_LANGUAGE);
		// Non-default tunes (e.g. user-created ones) have no descriptions either
		expect(getSheetPdfLanguage("No Such Tune", "de")).toBe(SHEET_FALLBACK_LANGUAGE);
	});
});

describe("getBookletPdfLanguage", () => {
	test("returns the requested language if any tune has a description in it, the fallback otherwise", () => {
		expect(getBookletPdfLanguage("de")).toBe("de");
		expect(getBookletPdfLanguage(SHEET_FALLBACK_LANGUAGE)).toBe(SHEET_FALLBACK_LANGUAGE);
		expect(getBookletPdfLanguage("xx")).toBe(SHEET_FALLBACK_LANGUAGE);
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
