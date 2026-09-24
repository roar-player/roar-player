import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Underground";

export const tune: RawTune = {
	categories: [ "uncommon", "new", "easy" ],
	sheet: sheetUrl + "underground.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X     X X     X X     X     X   ',
			ms: 'X     X X     X X     X     X   ',
			hs: 'X     X X     X X     X     X   ',
			re: '          sfX     sfX     fX  fX',
			sn: '....X.....X.X.......X.......X...',
			ta: '  X X     X X     X X     X   X ',
			ag: 'a  ao o a  o  o a  ao o         ',
			sh: '................................'
		},
		Intro: {
			ls: '            A               A                              A    ',
			ms: '@ls',
			hs: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			re: 's..X  X     A   s..X  X     A   s..X    S..X   S..X  X     A    '
		},
		"Break 1": {
			ls: 'X  XX X X  X  X X  XX X A       ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Intro", "Tune", "Break 1", "Tune" ]]
};
