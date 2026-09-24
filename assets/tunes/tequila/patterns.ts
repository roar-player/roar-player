import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Tequila";

export const tune: RawTune = {
	categories: [ "uncommon", "medium", "western" ],
	sheet: sheetUrl + "tequila.pdf",
	patterns: {
		Tune: {
			loop: true,
			upbeat: 1,
			ls: 'X0 00 X 0 X     X0 00 X 0        ',
			ms: ' X XX   X        X XX   X        ',
			hs: '     X               X           ',
			re: '     X      hX       X    X XrXh ',
			sn: ' ....X.......X.X.....X.......X...',
			ta: '     X       X X     X       X   ',
			ag: ' a a o  a a ao o a a o  a        ',
			sh: ' ................................'
		},
		'Break 1': {
			ls: '                ',
			ms: '                ',
			hs: '                ',
			ag: 'ooooo o a       ',
			ot: '           uvx  '
		},
		'Break 2': {
			upbeat: 3,
			ls: 'X               X               X                  ',
			ms: ' XX       X      XX       X      XX       X        ',
			hs: '   X               X               X               ',
			sh: '   XXXXXXXX        XXXXXXXX        XXXXXXXX        '
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: repeat(3, '    X       X X '),
			ms: '@ls',
			hs: '@ls',
			re: repeat(3, 'X X    X X X    '),
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 2", "Break 1", "Tune", "Tune", "Bra Break", "Break 1", "Tune", "Tune" ]]
};
