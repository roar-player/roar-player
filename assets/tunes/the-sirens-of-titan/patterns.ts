import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "The Sirens of Titan";

export const tune: RawTune = {
	categories: [ "uncommon", "medium" ],
	time: 3,
	speed: 120,
	sheet: sheetUrl + "the-sirens-of-titan.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X  X              X  X        X  X        XXXX  ',
			ms: '            X  X        X  X                    ',
			hs: '      XXXX                          X  X        ',
			re: repeat(4, 'X  X  X XX  '),
			sn: repeat(4, 'X..X..X..X..'),
			ta: 'XXXX        XXXX        XXXX  XXXX  XXXX        ',
			ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
			sh: repeat(4, 'X XX  X XX  ')
		},
		'Rented a Tent Break': {
			ls: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX      X  ',
			ms: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX   XXX   ',
			hs: '   X  X  X     X  X  X     X     X        XXX   ',
			re: 'XXXX XX XX  XXXX XX XX  XXXX  XXXX  XXX   XXXX  ',
			sn: 'XXXX.XX.XX..XXXX.XX.XX..XXXX..XXXX..XXX...XXXX..',
			ta: '@re',
			ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Rented a Tent Break", "Tune" ]]
};
