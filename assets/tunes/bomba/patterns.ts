import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Bomba";

export const tune: RawTune = {
	categories: ["new", "uncommon", "tricky"],
	sheet: sheetUrl + "bomba.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/3898aU5Yn4dd9a1SyxoJn2",
	patterns: {
		Tune: {
			loop: true,
			ls: "X  X     X X  X X  X     X X  X ",
			ms: "    X       X       X       X   ",
			hs: "      XX     XX       XX     XX ",
			re: "X X  X X   X  X X X  X X        ",
			sn: "..XX..X...XX..X...XX..X...XX..X.",
			ta: "    X    X X        X    f XX XX",
			ag: "o ooao o o oa   o ooao o        ",
			sh: "..XX..XX..XX..XX..XX..XX..XX..XX"
		},
		"Break 1": {
			ls: "X     X                         ",
			ms: "@ls",
			hs: "@ls",
			re: "          XXX X X X   X X   X   ",
			time: 8
		},
		"Break 2": {
			ls: "XX  XX  XX  XX  ",
			ms: "@ls",
			hs: "  XX  XX  XX  XX",
			re: "@hs",
			sn: "..XX..XX..XX..XX",
			ta: "@hs",
			ag: "ooaaooaaooaaooaa"
		},
		"Call Break": {
			ls: "X     X                         X     X                         X     X                         X X     X X     X X     X X    ",
			ms: "@ls",
			hs: "X     X                         X     X                         X     X                             X X     X X     X X     X X",
			re: "          XXX X X X   X X   X             XXX X X X   X X   X             XXX X X X   X X   X       X X     X X     X X     X X",
			sn: "X     X                         X     X                         X     X                         . . X X . . X X . . X X . . X X",
			ta: "@hs",
			ag: "o     o                         o     o                         o     o                         o o a a o o a a o o a a o o a a",
			time: 8
		}
	},
	exampleSong: [["Call Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune"]]
};
