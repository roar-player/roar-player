import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Orangutan";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "orangutan.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '    XXXX    XXXX',
			ms: 'X XX        XXXX',
			hs: '        X XX    ',
			re: 'X rrX rr rrrX r ',
			sn: '..XX..XX..XX..XX',
			ta: '  XX XX   XX XX ',
			ag: 'oa  o aa o  a oo',
			sh: '@sn'
		},
		"Funky gibbon" : {
			ls: 'X   X   X  XX X XX              X   X   X  XX X X               ',
			ms: '@ls',
			hs: '@ls',
			re: '  r   r   r   r   r   r   r   r   r   r   r   r   r   r   r   r ',
			sn: '..X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X.',
			ta: '@re',
			ag: '@re',
			sh: '  X   X   X   X   X   X   X   X   X   X   X   X   X   X   X   X '
		},
		"Monkey break" : {
			ls: '  XX XX   XX XX ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: 'G       G       '
		},
		"Break 2": {
			ls: 'X   X       X   ',
			ms: '@ls',
			hs: '@ls',
			re: '  XX  XX XXX  X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Tune", "Tune", "Monkey break", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Funky gibbon", "Funky gibbon", "Tune", "Tune", "Tune", "Tune" ]]
};
