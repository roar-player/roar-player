import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Coupe-Decale";

export const tune: RawTune = {
	displayName: "Coupé-Décalé",
	categories: [ "medium", "uncommon" ],
	sheet: sheetUrl + "coupe-decale.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: "X       X X     X       X X     X       X X     X       XXXX    ",
			ms: "   X  X     X  X   X  X     X  X   X  X     X  X   X  X     XXXX",
			hs: "@ms",
			re: "X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...",
			sn: "@re",
			ta: "X  X      f X   X  X            X  X      f X   X  X    XXXX    ",
			ag: "o  a            o  a  a o o a  ao  a            o  a  a o o a  a",
			sh: "X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
		},
		"Break 1": {
			ls: "X   X   X   X   X   X   X                 X",
			ms: "@ls",
			hs: "@ls",
			re: "X   X   X   X   X   X   X     f     X     X",
			sn: "@ls",
			ta: "@ls",
			ag: "a   a   a   a   a   a   a                  ",
			sh: "@ls",
			time: 12
		},
		"Break 2": {
			ls: "                                          X                                               X                                               X     X   X   X   X   X   X   X                 X",
			ms: "@ls",
			hs: "@ls",
			re: "X        X                          X           X        X                          X           X        X                          X           X   X   X   X   X   X   X     f     X     X",
			sn: "@re",
			ta: "@re",
			ag: "a        a                          a           a        a                          a           a        a                          a           a   a   a   a   a   a   a                  ",
			sh: "@re",
			time: 12
		},
		"Intro": {
			ls: "                                                                                                                                                                                                                                                        XXXX    ",
			ms: "                                                                                                                                                                                                                                                            XXXX",
			re: "r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   ",
			sn: "@re",
			ta: "                                                                                                                                X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            ",
			ag: "                                                                o  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  a",
			sh: "                                                                                                                                                                                                X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
		},
		"Tune (6/8)": {
			loop: true,
			ls: "X     XX    X     XX",
			ms: "  X XX   X X  X XX   X X",
			hs: "@ms",
			re: "X.X.XX.X.X..X.X.XX.X.X..",
			sn: "@re",
			ta: "X X X  f X  f X X    X X",
			ag: "o a aaoo a ao a aaoo a a",
			sh: "X..X..X..X..X..X..X..X..",
			time: 3
		},
		"Intro (6/8)": {
			ls: "                                    XXX XXX XXX",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "o a aaoo a ao a aaoo a ao a aaoo a a           ",
			sh: "@ls",
			time: 3
		},
		"Crest Break (6/8)": {
			ls: "    XX    XX          XX    XX    XX          XX            XXX XXX XXX",
			ms: "@ls",
			hs: "@ls",
			re: "XXXX  XXXX  XXXXXXXXXX  XXXX  XXXX  XXXXXXXXXX  X X XX X X X           ",
			sn: "@ls",
			ta: "@ls",
			ag: "    aa    oo          aa    oo    aa          oo            aaa ooo ooa",
			sh: "@ls",
			time: 3
		}
	},
	exampleSong: [[ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Intro (6/8)", "Tune (6/8)", "Crest Break (6/8)", "Tune (6/8)", "Break 2", "Tune", "Break 1" ]]
};
