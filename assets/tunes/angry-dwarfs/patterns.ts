import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Angry Dwarfs";

export const tune: RawTune = {
	categories: [ "uncommon" ],
	sheet: sheetUrl + "angry-dwarfs.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 's   X   s   X   ',
			ms: 'X  XX  XX  XX X ',
			hs: '@ms',
			re: '  f  f    f  f  ',
			sn: '..XX..X...XX..X.',
			ta: '  X   X   X X X ',
			ag: 'a  ao  ao a a   ',
			sh: 'X..XX..XX..XX..X'
		},
		'Intro': {
			ls: repeat(4, '                ') + repeat(3, '        XX XX X ') + '    X       X   ',
			ms: repeat(4, '                ') + repeat(3, '        XX XX X ') + 'X       X   X X ',
			hs: repeat(4, '                ') + repeat(3, '        XX XX X ') + '            X X ',
			re: repeat(4, '                ') + repeat(3, 'XX XX X         ') + '  X   X   X X X ',
			sn: repeat(4, '                ') + repeat(3, '        XX XX X ') + '                ',
			ta: repeat(8, '  X   X   X X X '),
			ag: '@sn',
			sh: '@sn'
		},
		'No-Cent-For-Axel-Break': {
			ls: '        XX XX X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '98 76 5         '
		},
		'Tension Break': {
			ls: '    X       X       X   XX XX X ',
			ms: '  X   X   X   X   X   X XX XX X ',
			hs: '                        XX XX X ',
			re: '@hs',
			ta: 'XX XX X         XX XX X XX XX X ',
			ag: '@hs',
			sh: '@hs'
		}
	},
	exampleSong: [[ "Intro", "Tune", "Tune", "Tune", "Tune", "No-Cent-For-Axel-Break", "Tune", "Tune", "Tune", "Tune", "Tension Break", "Tune", "Tune", "Tune", "Tune" ]]
};
