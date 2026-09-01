import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Police";

export const tune: RawTune = {
	displayName: "Sound of da Police",
	categories: [ "new", "uncommon", "medium" ],
	sheet: sheetUrl + "sound-of-da-police.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/a8253384-c3bb-4b9f-a50c-aa954288bb37",
	patterns: {
		Intro: {
			ls: "      XXXXXXX         XXX XXX   ",
			ms: "@ls",
			hs: "@ls",
			ot: "D  D            D  D            ",
		},
		Tune: {
			loop: true,
			ls: "X  X    s   s   X  X    s   s   ",
			ms: "      XXXXXXX         XXX XXX   ",
			hs: "@ms",
			re: "f hf hXhf h Xhrhf hf hXhf h Xhrh",
			sn: "X..X........X...X..X........X...",
			ta: "  XX  XX      XX  XX  XX      XX",
			ag: "a  a  a o a o   a  a  a o a o   ",
			ot: "D  D            D  D            ",
		},
		"Break 1": {
			ls: "X X X X X X X X ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "o o o o o o o o ",
		},
		"Break 2": {
			ls: "X  X            X  X            ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "a  a            a  a            ",
			ot: "D  D            D  D            ",
		},
		"Beast Break": {
			ls: "X  X            X  X            ",
			ms: "@ls",
			hs: "@ls",
			re: "      XXXXXXX         XXX XXX   ",
			sn: "@ls",
			ta: "@ls",
			ag: "      aaaaaaa         aaa aaa   ",
			ot: "D  D            D  D            ",
		},
		"Beast Break Inverted": {
			ls: "      XXXXXXX         XXX XXX   ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "a  a            a  a            ",
			ot: "D  D            D  D            ",
		},
	},
	exampleSong: [["Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Beast Break", "Tune", "Tune", "Beast Break Inverted"]]
};
