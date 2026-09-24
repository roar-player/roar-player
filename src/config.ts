import * as z from "zod";
import { getI18n } from "./services/i18n";
import { instruments, instrumentAliases, volumePresets } from "../assets/instruments/config";

/**
 * The instruments, their strokes and the volume presets are defined in assets/instruments/config.ts (the
 * audio files live in assets/instruments/<instrument>/), the tunes and their categories in assets/tunes/.
 * This module only holds app-level configuration and derives the instrument types/keys from the data, so
 * that derived players can replace instruments and tunes without touching anything in src/.
 */

export type Instrument = keyof typeof instruments;
const instrumentKeys = Object.keys(instruments) as Instrument[];
export const instrumentValidator = z.enum(instrumentKeys as [Instrument, ...Instrument[]]);

export const strokeValidator = z.string();
/** A stroke is a single sound that an instrument makes. It is identified by a single character, corresponding to the file name of the audio file in assets/instruments/<instrument>/. */
export type Stroke = z.infer<typeof strokeValidator>;

/** Categories by which the tune list can be filtered. They are collected from the tune definitions (see src/defaultTunes.ts). */
export const categoryValidator = z.string();
export type Category = z.infer<typeof categoryValidator>;

export type StrokeConfig = {
	/** The representation of the stroke in the notes as displayed to the user. */
	display: string;
	/** An optional tooltip/legend text describing the stroke further. */
	description?: () => string;
};

export type InstrumentConfig = {
	name: () => string;
	/** Optional shorter name used when the instrument is listed along with other instruments (e.g. on a shared row of the tune sheets or in a volume annotation). */
	shortName?: () => string;
	/**
	 * The strokes that this instrument can play, mapped to their display configuration. The key order
	 * defines the order in the stroke picker. The same stroke character can be configured differently
	 * for different instruments.
	 */
	strokes: Record<Stroke, StrokeConfig>;
};

export type Config = {
	/** The name of the app as it should be shown throughout the UI, such as “RoR Player” */
	appName: string;

	/** An array listing the keys of all available instruments. */
	instrumentKeys: Instrument[];

	instruments: Record<Instrument, InstrumentConfig>;

	/**
	 * Optional aliases for groups of instruments in the condensed pattern representation (tune sheets and
	 * pattern player annotations): when all instruments of an alias play the same line, the row is labelled
	 * with the alias name instead of the individual instrument names. A row whose instruments can be fully
	 * expressed through aliases is labelled that way even if it would otherwise be labelled “Everybody else”
	 * (and keeps its position in the instrument order).
	 */
	instrumentAliases?: Array<{ name: () => string; instruments: Instrument[] }>;

	/** Presets for the values of the instrument volume sliders, by preset name. */
	volumePresets: Record<string, {
		displayName: () => string;
		volumes: Record<Instrument, number>;
	}>;

	/**
	 * The available time signatures. The key is the number of strokes per beat, the value is the name of the time measurement as it should be
     * shown in the UI.
	 */
	times: Record<number, () => string>;

	/**
	 * The stroke resolution that will be used throughout the app, in number of strokes per beat. This has to be the least common multiple of
     * the available time signatures. For example, to allow for both rhythms that use 4 strokes per beat and rhythms that use 3 strokes per
     * beat, the stroke resolution needs to be 12 (or a multiple thereof).
	 */
	playTime: number;

	/**
	 * The current tune of the year. It will be opened by default when the app is opened. If multiple tunes are specified, one of them will be
	 * randomly picked each time.
	 */
	tuneOfTheYear: string | string[];

	/**
	 * The default speed to use for tunes that don't specify a separate default speed, in beats per minute.
	 */
	defaultSpeed: number;
};

const config: Config = {
	appName: document.title,

	instrumentKeys,

	instruments,

	instrumentAliases,

	volumePresets,

	times: {
		2: () => "2⁄4",
		3: () => "6⁄8",
		4: () => "4⁄4",
		5: () => "5⁄8",
		6: () => "3⁄4",
		8: () => "8⁄8",
		12: () => getI18n().t("config.time-with-triplets", { time: "4⁄4" }),
		20: () => getI18n().t("config.time-with-quintuplets", { time: "4⁄4" })
	},

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above.
	// 720 is the least common multiple of all supported subdivisions (2–24, including 9 and 16). The high
	// resolution also keeps the rounding error of tempo changes (see the speed hack) below one slot, which is
	// ~1.4ms at 60bpm and thus inaudible.
	playTime: 720,

	tuneOfTheYear: "The Roof Is on Fire",

	defaultSpeed: 100
};

// Check some requirements for export so that we don't forget them at some point in the future
for(const instr of instrumentKeys) {
	if(instr.length != 2)
		throw new Error("Instrument key must be 2 characters long for `" + instr + "` due to pattern encoder.");
	for(const stroke of Object.keys(config.instruments[instr].strokes)) {
		if(stroke.length != 1)
			throw new Error("Stroke key must be one character for `" + stroke + "`.");
		if(stroke == "+" || stroke == "@")
			throw new Error("Stroke must not be `+` or `@` as it would conflict with pattern encoder.");
	}
}

export default config;
