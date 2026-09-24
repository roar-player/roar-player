import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Kaerajaan";

export const tune: RawTune = {
	categories: [ "new", "uncommon", "medium", "onesurdo", "western" ],
	sheet: sheetUrl + "kaerajaan.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: "X   0 X X   0 X X   0 X X   X",
			ms: "@ls",
			hs: "@ls",
			re: "  XX  X   XX  X   XX  X f X X",
			sn: "....X.......X.......X.......X...",
			ta: "X X X   X X X   X X XX XX   X",
			ag: "a a o  oa a o  oa a a a o   o  o",
			sh: "@sn"
		},
		"Break 1": {
			ls: "X X X   X X X   X X XX XX    ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "a a o   a a o   a a aa ao    ",
			sh: ". . .   . . .   . . .. ..    ",
			ot: "                            F"
		},
		'Break 2': {
			ls: '                X X XXX X X X                   X X XXX   X X   ',
			ms: '@ls',
			hs: '@ls',
			re: 'X   X  XX X X                   X   X  XX X X                   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]]
};
