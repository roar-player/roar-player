import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Jungle";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "jungle.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '    X       X X     X       X X ',
			ms: 'XXXX    XX      XXXX    XX      ',
			hs: ' X    X  X    X  X    X  X    X ',
			re: ' f  r X  f  r X  f  r X  f  r X ',
			sn: 'XX..X...XX..X...XX..X..X.X..X...',
			ta: 'X  X    X  X  X X  X    X  X  X ',
			ag: 'ooo a o aa  o   aaa   o aa  o   ',
			sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
		},
		'Break 1': {
			ls: 'XXX             XXX X           XXX             XXX X X XX  X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '      o aa  o         o aa  o         o aa  o   ooo o o oo  o   ',
			sh: '@ls'
		},
		'Break 2': {
			ls: 'X  XX X X  XX X ',
			ms: 'X  XX X X  XX   ',
			hs: '@ms',
			re: '@ms',
			sn: '@ms',
			ta: '@ms',
			ag: '@ms',
			sh: '@ms'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]]
};
