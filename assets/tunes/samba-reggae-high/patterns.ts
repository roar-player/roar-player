import { RawTune, stretch } from "../helpers";

export const tuneName = "Samba Reggae High";

export const tune: RawTune = {
	categories: [ "proposed", "cultural-appropriation" ],
	patterns: {
		Tune: {
			loop: true,
			ls: "0   X   0   X X ",
			ms: "X   0   X   0   ",
			hs: "0     X 0   XXXX",
			re: "  XX  XX  XX  XX",
			sn: "X..X..X...X..X..",
			ta: "X XX XXX  X  X  ",
			ag: "o a a oo a aa o ",
			sh: "................"
		},
		"Break 1": {
			ls: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ",
			ms: "@ls",
			hs: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX",
			re: "XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ",
			sn: "                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Break 2": {
			ls: "            XXXX            XXXX            XXXX            XXXX",
			ms: "@ls",
			hs: "@ls",
			re: "X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Break 3": {
			ls: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ",
			ms: "@ls",
			hs: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX",
			re: "                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ",
			sn: "X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...",
			ta: "                                X  X  X   X                     X  X  X   X                 X X             X X                 ",
			ag: "                                X  X  X   X                     X  X  X   X                 a a             a a                 ",
			sh: "                                X  X  X   X                     X  X  X   X                                                     "
		},
		"Pickup": {
			hs: "            XXXX"
		},
		"Stop on 1": {
			ls: "X               ",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Tam Entrada": {
			time: 3,
			ta: "XXXXXXXXXXXX",
		},
		"Tam “Bossa Mess About”": {
			time: 12,
			ta: stretch(4, 12, "X  X  X   X  X  X  X  X  XX  X  X  X  X  XX XX  X  X  X ") + stretch(3, 12, "XXXXXX"),
		},
		"Tam “Little Turn” Groove": {
			ta: "X   XXXXX       X X XXXXX       X X X   XXXXX   XX XX   XXXXX   "
		}
	},
	exampleSong: [[ "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]]
};
