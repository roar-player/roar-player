import { RawTune, repeat } from "../helpers";

export const tuneName = "Samba Reggae Low";

export const tune: RawTune = {
	categories: [ "proposed", "cultural-appropriation" ],
	patterns: {
		Tune: {
			loop: true,
			ls: "0   X   0   X   0   X   0   X   ",
			ms: "X   0   X   0   X   0   X   0   ",
			hs: "0     XX0     XX0     XX0 X XXXX",
			re: "  XX  XX  XX  XX  XX  XX  XX  XX",
			sn: "X..X..X...X.X...X..X..X...X.X...",
			ta: "X  X  X   X X   X  X  X   X X   ",
			ag: "o  a  o   a a   o  a  o   a a   ",
			sh: "................................"
		},
		"Bra Break": {
			displayName: "Call Break",
			ls: "          X X             X X             X X                                                                 X ",
			ms: "          X X             X X             X X                                                                   ",
			hs: "@ms",
			re: "f XX XX X       f XX XX X       f XX XX X                                                                       ",
			sn: "          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...",
			ta: "          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
			ag: "@ms",
			sh: "@ms"
		},
		"SOS Break": {
			ls: "X       X       X       X       X       X       X       X     X ",
			ms: "X       X       X       X       X       X       X       X       ",
			hs: "@ms",
			re: "  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ",
			sn: "@re",
			ta: "@re",
			ag: "@re",
			sh: "@re"
		},
		"Knock On The Door Break": {
			time: 12,
			ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls"
		},
		"Knock On The Door (Cut)": {
			time: 12,
			ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
			ms: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
			hs: "@ms",
			re: "X                                   X   X   X   X                                               X        X        X           X     X     X     X     X     X  X     X     X     X     X  X     ",
			sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
			ta: "@ms",
			ag: "@ms",
			sh: "@ms"
		},
		"Dancing Break": {
			ls: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                 X ",
			ms: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   ",
			hs: "@ms",
			re: "                X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X   ",
			sn: "@re",
			ta: "@re",
			ag: "@re",
			sh: "@re"
		},
		"Pickup": {
			ls: "              X "
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
		"Fancy Tam Line": {
			ta: repeat(2, "X  X  X   X X   X  X  X   X X   ") + repeat(2, "X  X  X   X X XXX  X  X XXX X   ")
		},
		"Fancy Tam Line 2": {
			ta: repeat(2, "X  X  X         X  X  X         ") + repeat(2, "X  X  X   XXX XXX  X  X         ")
		}
	},
	exampleSong: [[ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]]
};
