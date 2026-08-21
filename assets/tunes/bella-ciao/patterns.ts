import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Bella Ciao";

export const tune: RawTune = {
	categories: ["uncommon", "new", "medium"],
	sheet: sheetUrl + "bella-ciao.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: repeat(4, "X  XX X X  XX X "),
			ms: repeat(4, "          XXXX  "),
			re: "f X       X X X f X       X X X f   X X f   X X f   f   f X X X ",
			sn: repeat(2, "...X..X....X..X....X..X..X.X..X."),
			ta: repeat(4, "    XXX   X X X "),
			ag: "    o o o           a a a       o       o       a   a   a       ",
			sh: repeat(4, "...X..X....X....")
		},
		"Break 1": {
			ls: "X   X X X   X X X   X   X       ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Break 2": {
			ls: "X X             X X             X X             XXX XXX X X X X ",
			ms: "@ls",
			re: "        XXX XXX         XXX XXX         XXX XXX XXX XXX X X X X "
		},
		"Intro": {
			upbeat: 6,
			ls: "r r r r r       r r r r r       r r r r   r r r   r r r   r   r r r r r r       r r r r r       r r r r   r   r   r   r               ",
			ms: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls"
		}
	},
	exampleSong: [["Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]]
};
