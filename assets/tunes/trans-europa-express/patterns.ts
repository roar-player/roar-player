import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Trans-Europa-Express";

export const tune: RawTune = {
	categories: [ "new", "uncommon", "medium" ],
	sheet: sheetUrl + "trans-europa-express.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/cdgQ9uW6rNwSQDTY5kibZW",
	patterns: {
		Tune: {
			upbeat: 1,
			loop: true,
			ls: " XX      X X     XX      X X     ",
			ms: "@ls",
			hs: "     X       X       X       X   ",
			re: "hX rhX  hX rhX  hX rhX  hX rhX  h",
			sn: " ....X..X....X..X....X..X....X..X",
			ta: " X     X X X   X X               ",
			ag: " o     o o o   o o               ",
			sh: ".X X.X  .X X.X  .X X.X  .X X.X  ."
		},
		"Doppler Break": {
			upbeat: 1,
			ls: "                                 XXXXXXXXXXXXXXXXssssssssssssssss",
			ms: "                             XXXXXXXXsssssssssssssssssssssssssss ",
			hs: "                 rrrrrrrrrrrrXXXX                                ",
			re: " rrrrrrrrrrrrrrrrrrrrrrrrrrrrXXXX                                ",
			sn: "     rrrrrrrrrrrrrrrrrrrrrrrrXXXX                                ",
			ta: "                             XXXX                                ",
			sh: ".X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  ."
		},
		"Break 1": {
			"upbeat": 1,
			"ls": " X               X                                               ",
			"ms": "         X       X               X                               ",
			"hs": "         X               X       X               Xsssssssssss    ",
			"re": " h                       X               r       X               ",
			"sn": "                                         r                       ",
			"ta": "                                         X                       ",
			"sh": ".X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  ."
		},
		"Tamborim Stroke": {
			"ls": "X     X X X   X X               ",
			"ms": "@ls",
			"hs": "@ls",
			"re": "@ls",
			"sn": "@ls",
			"ta": "@ls",
			"ag": "o     o o o   o o               ",
			"sh": "@ls"
		}
	},
	exampleSong: [[
		{ patternName: "Tune", instruments: ["ls", "ms", "hs", "sh"] },
		{ patternName: "Tune", instruments: ["ls", "ms", "hs", "sh"] },
		"Break 1",
		"Tune", "Tune", "Tune", "Tune",
		"Doppler Break",
		"Tune", "Tune", "Tune", "Tune",
		"Tamborim Stroke",
		"Tune", "Tune", "Tune", "Tune"
	]]
};
