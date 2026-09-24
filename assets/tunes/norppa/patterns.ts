import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Norppa";

export const tune: RawTune = {
	categories: [ "new", "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "norppa.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: "X   X   X   X   ",
			ms: "      X        X",
			hs: "  X       X     ",
			re: "  X   X   X  f r",
			sn: "..X...X...X..X.X",
			ta: " X   X   X XX  X",
			ag: "   a    a  a   a"
		},
		'Break 1': {
			ls: "        X       ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "X.X.X.X.X       ",
			ta: "@ls",
			ag: "        o       ",
			ot: "            F   "
		},
		'Break 2': {
			ls: " X X X X X X X XX X X X X       ",
			ms: "                X X X X X       ",
			hs: "X X X X X X X X X X X X X       ",
			re: "        r r r r rrrrXXXXX       ",
			sn: "        . . . . X.X.XXXXX       ",
			ta: "            X X X X X X X       ",
			ag: "                           ooooo",
		},
		'Break 3': {
			ls: "X X X X X X X X ",
			ms: "    X X X X X X ",
			hs: "      X X X X X ",
			re: "        X X X X ",
			sn: "          X X X ",
			ta: "            X X ",
			ag: "              o "
		},
		'Call break': {
			ls: "X               ",
			ms: "@ls",
			hs: "@ls",
			re: "        X       ",
			sn: "@re",
			ta: "@re",
			ag: "        o       ",
			ot: "    F       F   ",
		},
		'Shouting break': {
			displayName: 'Shouting break (replace with own shout)',
			ls: "X            XX ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "a            aa ",
			sh: "@ls",
			ot: "  '  =Å \\ l     ",
		},
		'Break 5': {
			ls: "X           XXXX",
			ms: "X            XXX",
			hs: "X             XX",
			re: "X              X",
			sn: "X               ",
			ta: "X XXXX         X",
			ag: "o      a        ",
			sh: "X               "
		}
	},
	exampleSong: [['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Call break', 'Tune', 'Tune', 'Tune', 'Tune', 'Shouting break', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 5', 'Tune', 'Tune', 'Tune', 'Tune']]
};
