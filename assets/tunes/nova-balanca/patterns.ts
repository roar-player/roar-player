import { RawTune, crescendo, sheetUrl } from "../helpers";

export const tuneName = "Nova Balanca";

export const tune: RawTune = {
	displayName: "Nova Balança",
	categories: [ "uncommon", "medium" ],
	sheet: sheetUrl + "nova-balanca.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X  X            ',
			ms: '     XX       X ',
			hs: '        X  X    ',
			re: 'XX  X       X   ',
			sn: '....X...XX..X...',
			ta: 'X  XX X X  XX X ',
			ag: 'o  oa o o  oa o ',
			sh: '................'
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: '    X     X         X     X     ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: 'XXXXX XXXXX     XXXXX XXXXX     ',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Break 1': {
			ls: 'X X X X X X X X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: crescendo(16)
		},
		'Break 2': {
			ls: 'X X X X XX XX X ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X  X X  X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune" ]]
};
