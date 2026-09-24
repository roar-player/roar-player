import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Shouting Breaks";

export const tune: RawTune = {
	sortPriority: 3,
	categories: [ "common", "onesurdo" ],
	sheet: sheetUrl + "breaks.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
	patterns: {
		"Democracy Break": {
			ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                X X X XX XX X X                 X X X XX XX X X                                                 X  X  X   X X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			ot: '                                                * , - ?: ;< = >                 * , - ?: ;< = >                 * , - ?: ;< = > * , - ?: ;< = > * , - ?: ;< = >                 ',
			volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1, 112: .4, 128: .7, 144: 1 }
		},
		'Tout le monde': {
			ls: 'X     X X     X X  XX X X   X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: 'b     c d     e g  qj k m   n   '
		},
		'Dance Break': {
			time: 2,
			ot: 'TUVWY Z '
		},
		'Wir sind hier': {
			time: 2,
			ls: "     XX      XX              XX ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls",
			ot: "K [\\    K [^    _ ` { | }~ À    "
		},
		'Keep it in the ground': {
			ls: "                          X X   ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls",
			ot: "Á   Â   Ã ÄÅ ÆÇ Á Â Ã ÄÅ        "
		},
		'Keine Profite mit der Miete': {
			time: 4,
			ls: "                X XXX X X X X X ",
			ms: "@ls",
			hs: "@ls",
			re: "@ls",
			sn: "@ls",
			ta: "@ls",
			ag: "@ls",
			sh: "@ls",
			ot: "È ÉÊË Ì Í Î Ï Ì                 "
		}
	}
};
