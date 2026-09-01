import { RawTune, repeat, crescendo, sheetUrl } from "../helpers";

export const tuneName = "Walc(z)";

export const tune: RawTune = {
	categories: [ "uncommon", "easy", "western" ],
	time: 6,
	speed: 60,
	sheet: sheetUrl + "walc.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X     X     X     X     ',
			ms: '  X X   X X   X X   XXXX',
			hs: '@ms',
			re: '  X X   XXX   X X   XXX ',
			sn: '..X.X...X.X...X.X.XXXXXX',
			ta: '  X X   X X       X X X ',
			ag: 'o a a o a a o a a o     ',
			sh: 'X X X X XXX X X X X XXX '
		},
		'Break 2': {
			ls: 'X X X                   ',
			ms: '      X X X             ',
			hs: '            X X X       ',
			re: '                  XXXXXX',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 3': {
			ls: 'X X X       X X X       X X   X X   X X X X     ',
			ms: '@ls',
			hs: '@ls',
			re: '      X           X         X     X X X X X     ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 5': {
			ls: '                  XXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '..X.X...X.X...X.X.XXXXXX',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: '      X           X         X     X     X X     ',
			ms: '@ls',
			hs: '@ls',
			re: 'X X X       X X X       X X   X X   X X         ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Cut-throat Break': {
			ls: 'X     X     X           ',
			ms: '@ls',
			hs: '@ls',
			re: '  X X   X X   X X       ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Cut-throat Break Fast': {
			ls: 'X  X  X                 ',
			ms: '@ls',
			hs: '@ls',
			re: ' XX XX XX               ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		"Karla Break (6⁄4)": {
			ls: repeat(3, 'XXXXXXXXXXXXXXXXXXXXXXXX') + 'X                       ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: { 0: .1, 24: .4, 48: .7, 72: 1  }
		},
		"8 up (6⁄4)": {
			ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: crescendo(48)
		},
		'Progressive (6⁄4)': {
			ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Progressive Karla (6⁄4)': {
			ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXXX                       ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Break 5", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Cut-throat Break", "Tune", "Tune" ]]
};
