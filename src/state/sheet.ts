import config, { Instrument, Stroke } from "../config";
import { Tune } from "./tune";
import defaultTunes, { defaultTuneFolders } from "../defaultTunes";
import { DEFAULT_LANGUAGE, getTuneDescriptionLanguages, LANGUAGES } from "../services/i18n";

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
 * The language in which the sheet PDFs of all tunes are generated and that is linked instead of languages
 * in which no PDF exists. scripts/generate-sheets.mjs derives the same language from the assets/i18n/ file
 * names.
 */
export const SHEET_FALLBACK_LANGUAGE = LANGUAGES.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : LANGUAGES[0];

/**
 * Returns the language whose generated sheet PDF should be linked for the given tune: the given language
 * if a sheet exists in it (sheets are only generated in the languages in which the tune has a description,
 * see scripts/generate-sheets.mjs), otherwise the fallback language, in which all sheets are generated.
 */
export function getSheetPdfLanguage(tuneName: string, lang: string): string {
	const folder = defaultTuneFolders[tuneName];
	return lang === SHEET_FALLBACK_LANGUAGE || (folder != null && getTuneDescriptionLanguages(folder).includes(lang))
		? lang
		: SHEET_FALLBACK_LANGUAGE;
}

/**
 * Returns the language whose generated booklet PDF should be linked: the given language if a booklet
 * exists in it (booklets are only generated in the languages in which at least one tune on the sheets has
 * a description, see scripts/generate-sheets.mjs), otherwise the fallback language.
 */
export function getBookletPdfLanguage(lang: string): string {
	return Object.keys(defaultTunes).some((tuneName) =>
		tuneHasSheet(defaultTunes[tuneName]) && getSheetPdfLanguage(tuneName, lang) === lang
	) ? lang : SHEET_FALLBACK_LANGUAGE;
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
