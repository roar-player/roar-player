import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Chichita";

export const tune: RawTune = {
	categories: ["uncommon", "new"],
	sheet: sheetUrl + "chichita.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: repeat(4, "X   X X X   X X "),
			ms: repeat(4, "X XX    X XX    "),
			re: "X         XX XX X         XX XX X         XX XX XXXXX X XXXXX X ",
			sn: repeat(4, "f XXf XXf XXf XX"),
			ag: "  ooa ooa         aao aao         ooa ooa         aao     aao   "
		},
		"Break 1": {
			ls: "X   X   X   X   ",
			ms: "@ls",
			re: "  X   X   X   X ",
			sn: "@re",
			ag: "@re"
		},
		"Break 2": {
			ls: "X   X   X   X   X               X               X               X   X   X   X   ",
			ms: "@ls",
			re: "  X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X ",
			sn: "@re",
			ag: "@re"
		},
		"Double Break 2": {
			ls: "X   X   X   X   X               X               X               X   X   X   X   X               X               X               X   X   X   X   ",
			ms: "@ls",
			re: "  X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X ",
			sn: "@re",
			ag: "@re"
		},
		"Intro": {
			ls: repeat(3, "X    XX    XX   "),
			ms: "@ls",
			re: repeat(3, "  XX    XX    X "),
			sn: "@re",
			ag: "@re"
		}
	},
	exampleSong: [["Intro", "Tune", "Break 1", "Tune", "Break 2", "Tune", "Double Break 2", "Tune"]]
};
