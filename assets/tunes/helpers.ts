/**
 * Shared type and helper functions for the tune definitions in the per-tune patterns.ts files.
 * This file is part of the tune data, not of the app code: derived players that replace the whole
 * tunes directory bring their own copy of it (and can extend it with their own helpers).
 */

import type { Tune } from "../../src/state/tune";
import { AllVolumeHack, compressedPatternValidator } from "../../src/state/pattern";
import * as z from "zod";

export type RawTune = Partial<Omit<Tune, 'patterns'>> & {
	patterns: Record<string, z.input<typeof compressedPatternValidator>>;
	time?: number;
	/** Tunes with a sortPriority are listed before all other tunes, in ascending priority order. */
	sortPriority?: number;
};

export function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([ "" ]).join(repeat((to/from)-1, " "));
}

export function repeat(n: number, pattern: string): string {
	let ret = "";
	for(let i=0; i<n; i++)
		ret += pattern;
	return ret;
}

export function crescendo(length: number, start: number = 0): AllVolumeHack {
	const r: AllVolumeHack = { };
	const a = .05;
	const b = (1-a)/(length-1);
	for(let i=0; i<length; i++)
		r[start+i] = a+b*i;
	return r;
}

export function decrescendo(length: number): AllVolumeHack {
	const r: AllVolumeHack = { };
	const b = 0.95/(length-1);
	for(let i=0; i<length; i++)
		r[i] = 1-b*i;
	return r;
}

export const sheetUrl = "https://github.com/rhythms-of-resistance/sheetbook/blob/master/generated/single/";

/**
 * The tune filter categories are collected from the tunes' categories fields (see src/defaultTunes.ts).
 * Categories listed here are shown first, in this order; all others follow in the order of their first
 * appearance in the tune definitions. Leave empty if the collection order is already the desired one.
 */
export const categoryOrder: string[] = [];
