import config, { Instrument } from "./config";
import { clone } from "./utils";
import { normalizePattern, Pattern } from "./state/pattern";
import { normalizeTune, Tune } from "./state/tune";
import { PatternReference } from "./state/song";
import { categoryOrder, type RawTune } from "../assets/tunes/helpers";

/**
 * The default tunes are defined in assets/tunes/<tune-slug>/patterns.ts (one folder per tune, holding all of
 * the tune's data — see assets/tunes/README.md). This module picks up all of these folders, resolves the
 * compressed pattern notation and exposes the result.
 */
const tuneModules = import.meta.glob<Partial<{ tuneName: string; tune: RawTune }>>("../assets/tunes/*/patterns.ts", { eager: true });

const rawTunes: { [tuneName: string]: RawTune } = {};

/**
 * Maps each default tune's name to the name of its folder in assets/tunes/. The folder name is the tune's
 * slug (used e.g. as the file name of the generated sheet PDF, see getTuneSlug()) and the key under which
 * its description.<lang>.md files are registered (see getTuneDescriptionHtml()).
 */
export const defaultTuneFolders: Record<string, string> = {};

for (const [modulePath, module] of Object.entries(tuneModules)) {
	if (module.tuneName == null || module.tune == null) {
		continue; // A tune folder whose definition is commented out (prepared for later)
	}
	rawTunes[module.tuneName] = module.tune;
	defaultTuneFolders[module.tuneName] = modulePath.split("/").at(-2)!;
}

/** The tunes that are listed before all others (ascending sortPriority), see getSortedTuneList(). */
const firstInSorting = Object.entries(rawTunes)
	.filter(([, tune]) => tune.sortPriority != null)
	.sort(([, a], [, b]) => a.sortPriority! - b.sortPriority!)
	.map(([name]) => name);

/**
 * The tune filter categories, collected from the tune definitions: "all" first, then the categories listed
 * in the categoryOrder of assets/tunes/helpers.ts, then the remaining ones in the order of their first
 * appearance (tunes with a sortPriority first), then "custom" (user-created tunes). Their display names are
 * looked up under the i18n key config.category-<category>, falling back to the category itself.
 */
export const defaultCategories: string[] = (() => {
	const collected = new Set<string>();
	for (const name of [...firstInSorting, ...Object.keys(rawTunes).filter((name) => !firstInSorting.includes(name))]) {
		for (const category of rawTunes[name].categories ?? []) {
			collected.add(category);
		}
	}
	collected.add("custom");
	return [...new Set(["all", ...categoryOrder.filter((category) => collected.has(category)), ...collected])];
})();

const defaultTunes: { [tuneName: string]: Tune } = { };

for(const i in rawTunes) {
	const tune = rawTunes[i];

	const newTune = clone(tune) as any as Tune; // Extra RawTune fields (time, sortPriority) are stripped by normalizeTune()

	for(const j in tune.patterns) {
		const pattern = tune.patterns[j];
		const newPattern = clone(pattern) as any as Pattern;
		if(!newPattern.time && tune.time)
			newPattern.time = tune.time;

		for(const k of config.instrumentKeys) {
			const thisPattern = pattern[k] = pattern[k] || "";
			// A line of the form "@xy" references the line of instrument xy (which must be defined above it)
			const m = thisPattern.match(/^@(..)$/);
			if(m && config.instrumentKeys.includes(m[1] as Instrument))
				newPattern[k] = clone(newPattern[m[1] as Instrument]);
			else {
				newPattern[k] = thisPattern.split('');
				newPattern.length = Math.max(newPattern.length || 0, newPattern[k].length - (pattern.upbeat || 0));
			}

			if(k == "ag")
				newPattern[k] = newPattern[k].map(function(it) { return it == "X" ? "o" : it; });
		}

		newPattern.length = Math.ceil(newPattern.length / (newPattern.time || 4));
		if (newPattern.length % 4) {
			// eslint-disable-next-line no-console
			console.error(`Unusual length ${newPattern.length} for ${j} of ${i}.`);
		}

		newTune.patterns[j] = normalizePattern(newPattern);
	}

	defaultTunes[i] = normalizeTune(newTune);

	const unknown = (defaultTunes[i].exampleSong || []).flat()
		.map((entry) => typeof entry === 'string' ? entry : entry.patternName)
		.filter((patternName) => !defaultTunes[i].patterns[patternName]);
	if(unknown.length > 0) {
		// eslint-disable-next-line no-console
		console.error(`Unknown breaks in example song for ${i}: ${unknown.join(", ")}`);
	}
}

Object.defineProperty(defaultTunes, "getPattern", {
	configurable: true,
	value: function(tuneName: string | PatternReference, patternName?: string): Pattern | null {
		if(Array.isArray(tuneName)) {
			patternName = tuneName[1];
			tuneName = tuneName[0];
		}

		return this[tuneName]?.patterns[<string> patternName];
	}
});

Object.defineProperty(defaultTunes, "firstInSorting", {
	configurable: true,
	value: firstInSorting
});

interface DefaultTunesMethods {
	getPattern(tuneName: string, patternName?: string): Pattern | undefined;
	getPattern(patternReference: PatternReference): Pattern | undefined;
	firstInSorting: Array<string>;
}

type DefaultTunes = Record<string, Tune> & DefaultTunesMethods;

export default defaultTunes as DefaultTunes;
