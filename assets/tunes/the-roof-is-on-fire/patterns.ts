import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "The Roof Is on Fire";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "the-roof-is-on-fire.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/1c318897-e3b7-436b-b319-4608774169e0",
	patterns: {
		Tune: {
			loop: true,
			ls: "        X       X       X   X   X ",
			hs: "    XXX     XXX     XXX     X   X ",
			re: "  X  X  X  XXXX   X X X X  XXXX   ",
			sn: "  ...XX.....X.X......XX.....X.X...",
			ta: "    X       X     X X X X   X     ",
			ag: "o a     o a     o a a a   a       ",
			sh: "  ................................",
			upbeat: 2
		},
		"Break 1": {
			ls: "    X X     X X             X     ",
			ot: "i l     i l     i l p $ % &       ",
			upbeat: 2
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: "                X     X X                       X     X X                       X     X X                       ",
			ms: "@ls",
			hs: "@ls",
			re: "X..X..X.X..X..X.                X..X..X.X..X..X.                X..X..X.X..X..X.                X  X  X X       ",
			sn: "@ls",
			ta: "@ls",
			ag: "                o     o a  a  a                 o     o a  a  a                 o     o a  a  a                 ",
			sh: "@ls",
			ot: "                                                                                                            '   "
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune" ]]
};
