import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Antitek";

export const tune: RawTune = {
	categories: ["uncommon", "new", "easy", "onesurdo"],
	sheet: sheetUrl + "antitek.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: "X   X   X   X   X   X   X   X   ",
			ms: "@ls",
			hs: "@ls",
			re: "r X r X r X r X r X r X r XXr X ",
			sn: "....X.......X.......X.......X...",
			ta: "X  X  X  X        XX            ",
			ag: "o  a  a o  a  a o  a  a o   a   ",
			sh: "................................"
		},
		"Break 1": {
			ls: "X       X  X  X ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Break 2": {
			ls: "XXX XXX XXX XXX ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Call Break": {
			ls: "                X X X X X X XXX X   X   X   X   X           XXX ",
			ms: "@ls",
			hs: "@ls",
			re: "X X X X X X XXX X   X   X   X   X   X   X   X   X           XXX ",
			sn: "                                X X X X X X XXX X           XXX ",
			ta: "                                                X           XXX ",
			ag: "                                                X           XXX ",
			sh: "                                                X           XXX "
		}
	},
	exampleSong: [["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Call Break", "Tune", "Tune"]]
};
