import { describe, expect, test } from "vitest";
import { buildTempoMap, gridToReal, realToGrid, resamplePattern } from "../tempo";

describe("buildTempoMap", () => {
	test("returns undefined without effective tempo changes", () => {
		expect(buildTempoMap([])).toBeUndefined();
		expect(buildTempoMap([{ slot: 100, factor: 1 }])).toBeUndefined();
	});

	test("builds piecewise segments with correct offsets", () => {
		const map = buildTempoMap([{ slot: 100, factor: 2 }, { slot: 200, factor: 0.5 }])!;
		expect(map).toEqual([
			{ grid: 0, real: 0, factor: 1 },
			{ grid: 100, real: 100, factor: 2 },
			{ grid: 200, real: 150, factor: 0.5 }
		]);
	});

	test("a mark at slot 0 replaces the initial factor", () => {
		expect(buildTempoMap([{ slot: 0, factor: 2 }])).toEqual([{ grid: 0, real: 0, factor: 2 }]);
	});

	test("unsorted marks are sorted, marks at the same slot use the last factor", () => {
		expect(buildTempoMap([{ slot: 200, factor: 4 }, { slot: 100, factor: 2 }, { slot: 200, factor: 3 }])).toEqual([
			{ grid: 0, real: 0, factor: 1 },
			{ grid: 100, real: 100, factor: 2 },
			{ grid: 200, real: 150, factor: 3 }
		]);
	});
});

describe("gridToReal/realToGrid", () => {
	const map = buildTempoMap([{ slot: 100, factor: 2 }, { slot: 200, factor: 0.5 }])!;

	test("maps positions through the tempo segments", () => {
		expect(gridToReal(map, 50)).toBe(50);
		expect(gridToReal(map, 150)).toBe(125);
		expect(gridToReal(map, 300)).toBe(350);
	});

	test("is invertible", () => {
		for (const slot of [0, 50, 100, 150, 200, 250, 300]) {
			expect(realToGrid(map, gridToReal(map, slot))).toBeCloseTo(slot, 10);
		}
	});
});

describe("resamplePattern", () => {
	test("moves strokes onto the resampled grid and adjusts the length", () => {
		const pattern: Array<string[] | undefined> = new Array(200);
		pattern[0] = ["a"];
		pattern[50] = ["b"];
		pattern[100] = ["c"];
		pattern[150] = ["d"];

		const map = buildTempoMap([{ slot: 100, factor: 2 }])!;
		const resampled = resamplePattern(pattern, map);

		expect(resampled.length).toBe(150);
		expect(resampled[0]).toEqual(["a"]);
		expect(resampled[50]).toEqual(["b"]);
		expect(resampled[100]).toEqual(["c"]);
		expect(resampled[125]).toEqual(["d"]);
	});

	test("merges strokes that end up on the same slot", () => {
		const pattern: Array<string[] | undefined> = new Array(20);
		pattern[0] = ["a"];
		pattern[1] = ["b"];

		const resampled = resamplePattern(pattern, buildTempoMap([{ slot: 0, factor: 10 }])!);

		expect(resampled[0]).toEqual(["a", "b"]);
	});

	test("keeps the interval error below one slot with no cumulative drift", () => {
		// An awkward factor over many strokes: each interval must stay within one slot of the exact value,
		// and the accumulated position must not drift (each stroke is rounded from its exact position)
		const factor = 140 / 60;
		const spacing = 30; // e.g. time 24 at playTime 720
		const count = 1000;
		const pattern: Array<string[] | undefined> = new Array(spacing * count + 1);
		for (let i = 0; i <= count; i++) {
			pattern[i * spacing] = [`stroke-${i}`];
		}

		const resampled = resamplePattern(pattern, buildTempoMap([{ slot: 0, factor }])!);

		const positions: number[] = [];
		resampled.forEach((strokes, i) => {
			if (strokes) {
				positions.push(i);
			}
		});
		expect(positions.length).toBe(count + 1);

		const exactSpacing = spacing / factor;
		for (let i = 1; i < positions.length; i++) {
			expect(Math.abs(positions[i] - positions[i - 1] - exactSpacing)).toBeLessThan(1);
		}
		expect(positions[positions.length - 1]).toBe(Math.round(count * spacing / factor));
	});
});
