import { RawTune } from "../helpers";

export const tuneName = "Flip Flop";

export const tune: RawTune = {
	categories: ["new", "uncommon", "medium"],
	patterns: {
		Tune: {
			loop: true,
			ls: "X r X  rX r X  rX r X  rX r X  r",
			ms: "  X    X  X    X  X    X  X XXXX",
			hs: "@ms",
			re: "X  XX  XX  XX  XX  XX  XXX XX  X",
			sn: "...XX.X ...XX.X....XX.XX X XX.X.",
			ta: "               XX X XX X X XX X ",
			ag: "o a oa o a oao                  ",
			sh: "X X X X X X X X X X X X X X X X ",
		},
		"Break 1": {
			ls: "        XXXXX   ",
			hs: "XXXXX           ",
			ag: "aaaaa  aooooo  o"
		},
		"Break 2": {
			ls: "X  X    X  X    X  X   X   X    ",
			ms: "@ls",
			hs: "@ls",
			re: "    XX      XX      XX   X  XXXX",
			sn: "@re",
			ta: "@re",
			ag: "    oo      oo      oo   o  oooo",
			sh: "@re"
		},
		"Break 3": {
			ag: "o a oa oa  oao aa a oao a  oao o"
		},
		"Ping Pong Break": {
			ls: "X XX  X X XX  X",
			ms: "@ls",
			hs: "@ls",
			re: "    XX X    XX X",
			sn: "@re",
			ta: "@re",
			ag: "    oo o    oo o",
			sh: "@re"
		},
		"Kick back": {
			loop: true,
			ls: "X   X   X   X   ",
			ms: "@ls",
			hs: "@ls",
			re: "   X  X    X  X ",
			sn: "@re",
			ta: "@re",
			ag: "  ao  a  aaa  a ",
			sh: "@re"
		},
		"Call Break": {
			ls: "   XX r    XX r    XXrr    XX r ",
			ms: "@ls",
			hs: "@ls",
			re: "f     rf f    rf     rrf f    r ",
			sn: "@re",
			ta: "@re",
			ag: "   oo r    oo r    oorr    oo r ",
			sh: "   XX      XX      XX      XX   "
		}
	},
	exampleSong: [["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Ping Pong Break", "Tune", "Tune", "Kick back", "Kick back", "Kick back", "Kick back", "Tune", "Tune", "Call Break", "Tune", "Tune"]]
};
