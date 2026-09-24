import { RawTune, stretch, repeat, sheetUrl } from "../helpers";

export const tuneName = "Rope Skipping";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "rope-skipping.pdf",
	patterns: {
		Tune: {
			loop: true,
			time: 12,
			ls: stretch(4, 12, repeat(2, 'XXXXXXXXX   X               X X ')),
			ms: stretch(4, 12, repeat(2, '  ss       XX     ss       XX   ')),
			hs: stretch(4, 12, repeat(2, '            X X XXXXXXXXX   X   ')),
			re: stretch(4, 12, repeat(2, 's XXf   s XXf   s XXf   XXX f   ')),
			sn: stretch(4, 12, repeat(2, '....X.......X.......X..XX..XX...')),
			ta: stretch(4, 12, 'X  XX   X  XX   X  XX  XX  XX   X  XX   X  XX   X  XX   ') + stretch(3, 12, 'XXX   '),
			ag: stretch(4, 12, repeat(2, 'a  aa  oo  oo a a  aa  oo  oo a ')),
			sh: stretch(4, 12, repeat(2, '................................'))
		},
		'Oh Shit': {
			ls: 'X               ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '        N   O   '
		},
		'Fuck Off': {
			ls: 'X               ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '        P   Q   '
		},
		'Break 1': {
			ls: 'X      XX         X    XX       ',
			ms: '@ls',
			hs: '@ls',
			re: '    X     X         X     X X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 2': {
			ls: 'XX  XX  XX  X     XX  XX  XX    ',
			ms: '@ls',
			hs: '@ls',
			re: '  XX  XX  XX    XX  XX  XX  X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 3': {
			ls: 'X   X   X   X   ',
			ms: '@ls',
			hs: '@ls',
			re: ' XX  XX  XX     ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Küsel Break': {
			ls: 'X XXX X X X X                   ',
			ms: '@ls',
			hs: '@ls',
			re: '                X XXX X X X X   ',
			sn: 'X..XX..XX...X.X.X.X.X.X.X.X.X...',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Skipping Agogo': {
			displayName: "Skipping Agogô",
			ag: 'a  aaa aa  aaaoao  ooo oo  oooao'
		},
		'I like to move it': {
			loop: true,
			re: '                X   X   X   X   ',
			ag: 'o   o   o   o a           a   a '
		},
		'Eye of the tiger': {
			time: 12,
			ls: stretch(4, 12, '                                              X                 '),
			ms: stretch(4, 12, '           X               X               X                    '),
			hs: stretch(4, 12, 'X       X     X         X     X         X                       '),
			sn: stretch(4, 12, '................................................                '),
			ag: stretch(4, 12, '                                                ') + 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Oh Shit", "Tune", "Tune", "Fuck Off", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Küsel Break", "Küsel Break", "Tune", "Tune", "Skipping Agogo", "Tune", "Tune", "I like to move it", "Tune", "Tune", "Eye of the tiger", "Tune", "Tune" ]]
};
