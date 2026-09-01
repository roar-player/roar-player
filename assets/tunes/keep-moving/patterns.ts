import { RawTune } from "../helpers";

export const tuneName = "Keep Moving";

export const tune: RawTune = {
	categories: ["new", "uncommon", "tricky"],
	patterns: {
		Tune: {
			loop: true,
			ls: "    X       X       X       X       X       X       X       X X ",
			ms: "XXX     XXX     XXX     X X X  XXXX     XXX     XXX     X X X   ",
			hs: "      X       X       X XXXXX X       X       X       X XXXXXXX ",
			re: "f   XXX f XXX X f   XXX f XXX   f   XXX f XXX X f   XXX f XXX   ",
			sn: "X..X..X.X..X..X.X..X..X.X...X...X..X..X.X..X..X.X..X..X.X...f   ",
			ta: "X  XX X X  XX X X  XX X X  XX   X  XX X X  XX X X  XX X X       ",
			ag: "a o a oa o aa a a o a oa o aa   a o a oa o aa a a o a oaooooa   ",
			sh: "X..X..X.X..X..X.X..X..X.X...X...X..X..X.X..X..X.X..X..X.X...X   "
		},
		"Break 1": {
			ls: "XXX   X XXX   X XXX   X X XXX   ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "X...........................f   ",
			ta: "@ls",
			ag: "aaa   o aaa   o aaa   o a ooa   "
		},
		"Break 2": {
			ls: "    X X     X X     X X     X X ",
			ms: "@ls",
			hs: "@ls",
			re: "XXX     XXX     XXX     XX Xf   ",
			sn: "@re",
			ta: "XXX     XXX     XXX     XX XX   ",
			ag: "a o a oa o aa a a o a oa o aa   "
		},
		"Washing Machine Break": {
			ls: "X       X  X X  X       X  XXXX X       X  X X  X       X  XXXX ",
			ms: "@ls",
			hs: "@ls",
			re: "X   X       X  XX   X           X   X       X  XX   X   X       ",
			sn: "............................................................... ",
			ta: "@re",
			ag: "o   o       a  ao   o          oo   o       a  ao   o   a      a",
			sh: "@re"
		}
	},
	exampleSong: [["Tune", "Break 1", "Tune", "Break 2", "Tune", "Washing Machine Break", "Tune"]]
};
