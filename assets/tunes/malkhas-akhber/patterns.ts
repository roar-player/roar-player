import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Malkhas Akhber";

export const tune: RawTune = {
	categories: [ "new", "uncommon", "tricky" ],
	sheet: sheetUrl + "malkhas-akhber.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/8wp31sH88dMbxHKxSXGAKM",
	patterns: {
		Tune: {
			loop: true,
			"ls": "X       X       X       X       ",
			"ms": "   XX X    XX X    XX X    XX X ",
			"hs": "@ms",
			"re": "                  Xr Xr   rXrh  ",
			"sn": "ff.X..X.ff.X..X.ff.X..X.ff.X..X.",
			"ta": "                        X X X X ",
			"ag": "  ooo o aoaoaoa                 "
		},
		"Hey Break": {
			displayName: "Hey! Break",
			"ls": "XX  r           ",
			"ms": "@ls",
			"hs": "@ls",
			"re": "@ls",
			"sn": "@ls",
			"ta": "@ls",
			"ag": "oo  r           ",
			"sh": "XX              ",
			"ot": "        F       "
		}
	},
	exampleSong: [["Tune", "Tune", "Hey Break", "Tune", "Tune"]]
};
