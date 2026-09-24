import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Cochabamba";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "cochabamba.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'XX  0    XX 0   XX  0    XX 0   ',
			ms: '@ls',
			hs: '    0 XX    0 XX    0 XX    0 XX',
			re: '  XX  X   XX  X   XX  XX  XX  X ',
			sn: '....X.......X.......X.......X...',
			ta: '@re',
			ag: 'aa.oo.aa.oo.a.a.oo.aa.oo.aa.o.o.',
			sh: '................................'
		},
		'Break 1': {
			ls: 'XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: { 0: .2, 16: .6, 32: 1  }
		},
		'Bra Break (Maestra)': {
			displayName: "Call Break (Maestra)",
			ls: '            X X             X X             X X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: 'ww ww ww ww     ww ww ww ww     ww ww ww ww     '
		},
		'Bra Break (Repi)': {
			displayName: "Call Break (Repi)",
			ls: '            X X             X X             X X ',
			ms: '@ls',
			hs: '@ls',
			re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Bra Break (Snare)': {
			displayName: "Call Break (Snare)",
			ls: '            X X             X X             X X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Cross Kicks': {
			ls: 'XX  0       0   ',
			hs: '    0       0 XX'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break (Repi)", "Tune", "Tune", "Cross Kicks", "Tune", "Tune" ]]
};
