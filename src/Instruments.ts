import { getI18n } from "./services/i18n";

/**
 * Modify this file to define custom instruments. You can add, remove, modify the instruments and their strokes.
 * For new instruments, you need to add the display name in the i18n file, and the sounds to assets/audio/.
 * See documentation for help: https://player-docs.rhythms-of-resistance.org/guide/technical/config.html
 */
export const instrumentKeys = ["ls", "ms", "hs", "re", "sn", "ta", "ag", "sh", "ot"] as const;

export const instruments: Record<typeof instrumentKeys[number], {
	name: () => string;
	/** The strokes that this instrument can play. Defines what options the stroke picker will display. */
	strokes: Array<string>;
}> = {
	ls: {
		name: () => getI18n().t("config.instruments-ls"),
		strokes: ["X", "0", "s", "t", "r"]
	},
	ms: {
		name: () => getI18n().t("config.instruments-ms"),
		strokes: ["X", "0", "s", "t", "r"]
	},
	hs: {
		name: () => getI18n().t("config.instruments-hs"),
		strokes: ["X", "0", "s", "t", "r"]
	},
	re: {
		name: () => getI18n().t("config.instruments-re"),
		strokes: ["X", "f", "r", "h", ".", "z", "s"]
	},
	sn: {
		name: () => getI18n().t("config.instruments-sn"),
		strokes: [".", "X", "r", "f"]
	},
	ta: {
		name: () => getI18n().t("config.instruments-ta"),
		strokes: ["X", "r", "f"]
	},
	ag: {
		name: () => getI18n().t("config.instruments-ag"),
		strokes: ["o", "a", "r", "."]
	},
	sh: {
		name: () => getI18n().t("config.instruments-sh"),
		strokes: ["X", "."]
	},
	ot: {
		name: () => getI18n().t("config.instruments-ot"),
		strokes: ["w", "y", "A", "B", "D", "E", "F", "G", "J", "K", "L", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z", "9", "8", "7", "6", "5", "b", "c", "d", "e", "g", "q", "j", "k", "m", "n", "u", "v", "x", "i", "l", "p", "$", "%", "&", "'", "(", ")", "*", ",", "-", "?", ":", ";", "<", "=", ">", "K", "[", "\\", "^", "_", "`", "{", "|", "}", "~", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "İ", "Ǐ", "Ī", "Ĩ", "Į", "Ĳ", "Ð", "Ñ", "Ò", "Ó", "Ô"]
	}
};

export const strokes: Record<string, string> = {
	"X": "X",
	"h": "hd",
	"0": "0",
	"s": "sil",
	"f": "fl",
	"r": "rim",
	"o": "l",
	"a": "h",
	"t": "w", // Whippy stick (tamborim stick)
	".": ".",
	"w": "Wh",
	"y": "Wh2", // Long whistle
	"z": "s", // Soft flare
	"A": "Oi!",
	"B": "Ua!",
	"D": "Oo",
	"E": "Ah",
	"F": "Hey!",
	"G": "Ook!",
	"J": "Groo",
	"L": "ve",
	"N": "Oh",
	"O": "Shit",
	"P": "Fuck",
	"Q": "Off",
	"R": "Hedge",
	"S": "Hog",
	"T": "E",
	"U": "very",
	"V": "bo",
	"W": "dy",
	"Y": "dance",
	"Z": "now",
	"9": "Kein",
	"8": "Cent",
	"7": "für",
	"6": "Ax",
	"5": "el",
	"4": "I’ve",
	"3": "got",
	"2": "cus",
	"1": "tard",
	"C": "in",
	"H": "my",
	"I": "un",
	"M": "der",
	"#": "pants",
	"b": "Tout",
	"c": "le",
	"d": "monde",
	"e": "dé",
	"g": "tes",
	"q": "te",
	"j": "la",
	"k": "po",
	"m": "li",
	"n": "ce",
	"u": "Te",
	"v": "qui",
	"x": "la",
	"i": "The",
	"l": "roof",
	"p": "is",
	"$": "on",
	"%": "fi",
	"&": "re",
	"'": "Burn!",
	"(": "Uh",
	")": "Ah",
	"*": "This",
	",": "is",
	"-": "what",
	"?": "de",
	":": "mo",
	";": "cra",
	"<": "cy",
	"=": "looks",
	">": "like",
	"K": "wir",
	"[": "sind",
	"\\": "hier",
	"^": "laut",
	"_": "weil",
	"`": "ihr",
	"{": "uns",
	"|": "die",
	"}": "Zu",
	"~": "kunft",
	"À": "klaut",
	"Á": "Keep",
	"Â": "it",
	"Ã": "in",
	"Ä": "the",
	"Å": "ground",
	"Æ": "I",
	"Ç": "say",
	"È": "Kei",
	"É": "ne",
	"Ê": "Pro",
	"Ë": "fi",
	"Ì": "te",
	"Í": "mit",
	"Î": "der",
	"Ï": "Mie",
	"İ": "dis",
	"Ǐ": "co",
	"Ī": "barr",
	"Ĩ": "ri",
	"Į": "ca",
	"Ĳ": "do",
	"Ð": "mar",
	"Ñ": "cha",
	"Ò": "que",
	"Ó": "re",
	"Ô": "mos",
};

export const volumePresets: Record<string, {
	displayName: () => string;
	volumes: Record<typeof instrumentKeys[number], number>;
}> = {
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
};
