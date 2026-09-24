import { RawTune, stretch, repeat, sheetUrl } from "../helpers";

export const tuneName = "Menaiek";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "menaiek.pdf",
	patterns: {
		Tune: {
			loop: true,
			time: 12,
			ls: stretch(4, 12, 'X   s X X   s X X   s X X   s X '),
			ms: stretch(4, 12, '    s   X         s     X   X   '),
			hs: stretch(4, 12, 'X   s         X   s         X   '),
			re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
			sn: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
			ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
			ag: stretch(4, 12, 'o   a   o     o   a   o o   o   '),
			sh: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
		},
		"Break 1": {
			ls: 'X X X XX X XX X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		"Break 2": {
			ls: repeat(3, '                      XXX XX  XX'),
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: repeat(3, 'o   a   o     o                 ') + 'o a o  o a oo o                 ',
			sh: '@ls'
		},
		"Double Break": {
			time: 12,
			ls: repeat(2, stretch(4, 12, 'X hXX hXX hXX hX')),
			ms: repeat(2, stretch(4, 12, '  s X    s  X X ')),
			hs: repeat(2, stretch(4, 12, 'X s    X s    X ')),
			re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
			sn: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
			ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
			ag: repeat(2, stretch(4, 12, 'o a o  o a oo oa')),
			sh: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
		},
		"Kick Back 1": {
			loop: true,
			time: 12,
			ls: stretch(4, 12, 'X   X  X   XX X '),
			ms: '@ls',
			hs: '@ls',
			re: stretch(4, 12, '  X       X ') + stretch(3, 12, 'XXX'),
			sn: '@re',
			ta: '@re',
			ag: stretch(4, 12, 'oaaoaaoa        '),
			sh: '@re'
		},
		"Mozambique Break": {
			ls: '   h  0    h  0 ',
			ms: '@ls',
			hs: '@ls',
			re: 'r r rr r rr rr r',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: 'X X XX X XX XX X'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Double Break", "Tune", "Tune", "Mozambique Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Tune", "Tune" ]]
};
