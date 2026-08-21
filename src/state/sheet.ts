import config, { Instrument, Stroke } from "../config";
import { Tune } from "./tune";
import { defaultTuneFolders } from "../defaultTunes";

/**
 * Helpers specific to the generated printable tune sheets (see src/ui/sheet/). The condensed pattern
 * representation that the sheets (and the condensed view of the pattern player) render lives in ./condensed.
 */

/**
 * Returns a URL/filename-safe identifier for a tune, used as the file name of generated sheet PDFs.
 * For default tunes this is the name of the tune's folder in assets/tunes/, otherwise a slug is derived
 * from the tune name.
 */
export function getTuneSlug(tuneName: string): string {
	return defaultTuneFolders[tuneName] ?? tuneName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Returns whether the given tune has any patterns that should be printed on the generated tune sheets. */
export function tuneHasSheet(tune: Tune): boolean {
	return Object.values(tune.patterns).some((pattern) => !pattern.hideFromSheet);
}

/**
 * Returns all instrument/stroke combinations that appear in any visible pattern of the given tunes
 * (strokes are configured per instrument, so the same stroke character can mean different things on
 * different instruments). Ordered by instrument, then by the instrument's configured stroke order
 * (with unconfigured strokes at the end).
 */
export function getUsedStrokes(tunes: Tune[]): Array<{ instrument: Instrument; stroke: Stroke }> {
	const used: Partial<Record<Instrument, Set<Stroke>>> = {};
	for (const tune of tunes) {
		for (const pattern of Object.values(tune.patterns)) {
			if (pattern.hideFromSheet) {
				continue;
			}
			for (const instrument of config.instrumentKeys) {
				for (const stroke of pattern[instrument] || []) {
					if (stroke && stroke.trim() !== "") {
						(used[instrument] ??= new Set()).add(stroke);
					}
				}
			}
		}
	}
	return config.instrumentKeys.flatMap((instrument) => {
		const usedStrokes = used[instrument];
		if (!usedStrokes) {
			return [];
		}
		const configured = Object.keys(config.instruments[instrument].strokes);
		return [
			...configured.filter((stroke) => usedStrokes.has(stroke)),
			...[...usedStrokes].filter((stroke) => !configured.includes(stroke))
		].map((stroke) => ({ instrument, stroke }));
	});
}
