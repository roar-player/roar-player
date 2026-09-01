/**
 * Everything instrument-related: the available instruments (in display order) with their per-instrument
 * strokes, the instrument aliases and the volume presets. This file is part of the app *data*, not of the
 * app code (like assets/tunes/): derived players can replace the whole assets/instruments directory
 * (together with the audio files in the per-instrument subdirectories) without patching anything in src/.
 *
 * The audio files live in ./<instrument key>/<hex>.mp3, where <hex> is the lower-case hex code of the
 * stroke character (e.g. ./ls/58.mp3 for stroke "X" of the low surdo).
 */

import type { InstrumentConfig } from "../../src/config";
import { getI18n } from "../../src/services/i18n";

export const instruments = {
	ls: {
		name: () => getI18n().t("config.instruments-ls"),
		strokes: {
			"X": { display: "X" },
			"0": { display: "0", description: () => getI18n().t("config.stroke-description-0") },
			"s": { display: "s", description: () => getI18n().t("config.stroke-description-sil") },
			"t": { display: "w", description: () => getI18n().t("config.stroke-description-w") },
			"r": { display: "r" },
		}
	},
	ms: {
		name: () => getI18n().t("config.instruments-ms"),
		strokes: {
			"X": { display: "X" },
			"0": { display: "0", description: () => getI18n().t("config.stroke-description-0") },
			"s": { display: "s", description: () => getI18n().t("config.stroke-description-sil") },
			"t": { display: "w", description: () => getI18n().t("config.stroke-description-w") },
			"r": { display: "r" },
		}
	},
	hs: {
		name: () => getI18n().t("config.instruments-hs"),
		strokes: {
			"X": { display: "X" },
			"0": { display: "0", description: () => getI18n().t("config.stroke-description-0") },
			"s": { display: "s", description: () => getI18n().t("config.stroke-description-sil") },
			"t": { display: "w", description: () => getI18n().t("config.stroke-description-w") },
			"r": { display: "r" },
		}
	},
	re: {
		name: () => getI18n().t("config.instruments-re"),
		strokes: {
			"X": { display: "X" },
			"f": { display: "f", description: () => getI18n().t("config.stroke-description-fl") },
			"r": { display: "r" },
			"h": { display: "h", description: () => getI18n().t("config.stroke-description-hd") },
			".": { display: ".", description: () => getI18n().t("config.stroke-description-.") },
			"z": { display: "z", description: () => getI18n().t("config.stroke-description-s") },
			"s": { display: "s", description: () => getI18n().t("config.stroke-description-sil") },
		}
	},
	sn: {
		name: () => getI18n().t("config.instruments-sn"),
		strokes: {
			".": { display: ".", description: () => getI18n().t("config.stroke-description-.") },
			"X": { display: "X" },
			"r": { display: "r" },
			"f": { display: "f", description: () => getI18n().t("config.stroke-description-fl") },
		}
	},
	ta: {
		name: () => getI18n().t("config.instruments-ta"),
		shortName: () => "Tambi",
		strokes: {
			"X": { display: "X" },
			"r": { display: "r" },
			"f": { display: "f", description: () => getI18n().t("config.stroke-description-fl") },
		}
	},
	ag: {
		name: () => getI18n().t("config.instruments-ag"),
		strokes: {
			"o": { display: "l" },
			"a": { display: "h" },
			"r": { display: "r" },
			".": { display: ".", description: () => getI18n().t("config.stroke-description-.") },
		}
	},
	sh: {
		name: () => getI18n().t("config.instruments-sh"),
		strokes: {
			"X": { display: "X" },
			".": { display: ".", description: () => getI18n().t("config.stroke-description-.") },
		}
	},
	ot: {
		name: () => getI18n().t("config.instruments-ot"),
		strokes: {
			"w": { display: "w", description: () => getI18n().t("config.stroke-description-wh") },
			"y": { display: "W", description: () => getI18n().t("config.stroke-description-wh2") },
			"A": { display: "Oi!" },
			"B": { display: "Ua!" },
			"D": { display: "Oo" },
			"E": { display: "Ah" },
			"F": { display: "Hey!" },
			"G": { display: "Ook!" },
			"J": { display: "Groo" },
			"K": { display: "wir" },
			"L": { display: "ve" },
			"N": { display: "Oh" },
			"O": { display: "Shit" },
			"P": { display: "Fuck" },
			"Q": { display: "Off" },
			"R": { display: "Hedge" },
			"S": { display: "Hog" },
			"T": { display: "E" },
			"U": { display: "very" },
			"V": { display: "bo" },
			"W": { display: "dy" },
			"Y": { display: "dance" },
			"Z": { display: "now" },
			"9": { display: "Kein" },
			"8": { display: "Cent" },
			"7": { display: "für" },
			"6": { display: "Ax" },
			"5": { display: "el" },
			"4": { display: "I’ve" },
			"3": { display: "got" },
			"2": { display: "cus" },
			"1": { display: "tard" },
			"C": { display: "in" },
			"H": { display: "my" },
			"I": { display: "un" },
			"M": { display: "der" },
			"#": { display: "pants" },
			"b": { display: "Tout" },
			"c": { display: "le" },
			"d": { display: "monde" },
			"e": { display: "dé" },
			"g": { display: "tes" },
			"q": { display: "te" },
			"j": { display: "la" },
			"k": { display: "po" },
			"m": { display: "li" },
			"n": { display: "ce" },
			"u": { display: "Te" },
			"v": { display: "qui" },
			"x": { display: "la" },
			"i": { display: "The" },
			"l": { display: "roof" },
			"p": { display: "is" },
			"$": { display: "on" },
			"%": { display: "fi" },
			"&": { display: "re" },
			"'": { display: "Burn!" },
			"(": { display: "Uh" },
			")": { display: "Ah" },
			"*": { display: "This" },
			",": { display: "is" },
			"-": { display: "what" },
			"?": { display: "de" },
			":": { display: "mo" },
			";": { display: "cra" },
			"<": { display: "cy" },
			"=": { display: "looks" },
			">": { display: "like" },
			"[": { display: "sind" },
			"\\": { display: "hier" },
			"^": { display: "laut" },
			"_": { display: "weil" },
			"`": { display: "ihr" },
			"{": { display: "uns" },
			"|": { display: "die" },
			"}": { display: "Zu" },
			"~": { display: "kunft" },
			"À": { display: "klaut" },
			"Á": { display: "Keep" },
			"Â": { display: "it" },
			"Ã": { display: "in" },
			"Ä": { display: "the" },
			"Å": { display: "ground" },
			"Æ": { display: "I" },
			"Ç": { display: "say" },
			"È": { display: "Kei" },
			"É": { display: "ne" },
			"Ê": { display: "Pro" },
			"Ë": { display: "fi" },
			"Ì": { display: "te" },
			"Í": { display: "mit" },
			"Î": { display: "der" },
			"Ï": { display: "Mie" },
			"İ": { display: "dis" },
			"Ǐ": { display: "co" },
			"Ī": { display: "barr" },
			"Ĩ": { display: "ri" },
			"Į": { display: "ca" },
			"Ĳ": { display: "do" },
			"Ð": { display: "mar" },
			"Ñ": { display: "cha" },
			"Ò": { display: "que" },
			"Ó": { display: "re" },
			"Ô": { display: "mos" },
		}
	},
} satisfies Record<string, InstrumentConfig>;

export const instrumentAliases = [
	{ name: () => "Low & Mid Surdo", instruments: ["ls", "ms"] },
	{ name: () => "Low & Hi Surdo", instruments: ["ls", "hs"] },
	{ name: () => "Mid & Hi Surdo", instruments: ["ms", "hs"] },
	{ name: () => "All Surdos", instruments: ["ls", "ms", "hs"] }
] satisfies Array<{ name: () => string; instruments: Array<keyof typeof instruments> }>;

export const volumePresets = {
	"Defaults": {
		displayName: () => getI18n().t("config.stroke-volume-defaults"),
		volumes: {
			ls: 0.7,
			ms: 0.7,
			hs: 0.7,
			re: 1.6,
			sn: 1.2,
			ta: 1.4,
			ag: 1,
			sh: 0.5,
			ot: 1
		}
	},
	"Shitty speakers": {
		displayName: () => getI18n().t("config.stroke-volume-shitty"),
		volumes: {
			ls: 1,
			ms: 1,
			hs: 1.1,
			re: 1.5,
			sn: 1.3,
			ta: 1.2,
			ag: 1,
			sh: 0.45,
			ot: 1
		}
	}
} satisfies Record<string, { displayName: () => string; volumes: Record<keyof typeof instruments, number> }>;
