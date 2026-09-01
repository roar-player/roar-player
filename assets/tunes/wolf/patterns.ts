import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Wolf";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "wolf.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: repeat(4, 'X   X   X   X   '),
			ms: repeat(4, '  XX     XXX    '),
			hs: repeat(2, '      XX      XX      XXXXXXXXXX'),
			re: repeat(2, 'X XX  r X X X rrX XX  r  XXXX rr'),
			sn: repeat(4, 'f.X...X...X...X.'),
			ta: 'X X     X X     XX XXX XX       X XX XX X X X X XX XXX XX       ',
			ag: repeat(4, 'ooooo a   a   a '),
			sh: repeat(4, '................')
		},
		'Pat 1': {
			ls: '              XXX     XXX       ',
			ms: '   X X     X X                  ',
			hs: 'XXXXXXXXX                       '
		},
		'Pat 2': {
			ls: '              XXX     XXX       ',
			ms: '   X X     X X                  ',
			hs: 'XXXXXXXXXXXXX                   '
		},
		'Break 1': {
			ls: '   XX  XX X X    XXXX  XX X X      XX  XX X X    XXXX  XX       ',
			ms: '@ls',
			hs: '@ls',
			sn: 'X               X               X               X               '
		},
		'Break 2': {
			ls: 'X X   XXX X    XX X    XX X     X X   XXX X    X X X X X        ',
			ms: '@ls',
			hs: '@ls',
			re: '    X       X       X       X       X       X  X X X X X        ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re',
			ot: '                                                            A   '
		}
	},
	exampleSong: [[ "Tune", "Pat 1", "Tune", "Pat 2", "Tune", "Break 1", "Tune", "Break 2", "Tune" ]]
};
