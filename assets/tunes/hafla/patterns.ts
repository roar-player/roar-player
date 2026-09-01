import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Hafla";

export const tune: RawTune = {
	categories: [ "common", "tricky" ],
	sheet: sheetUrl + "hafla.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/2fbb7d46-3399-4818-89aa-a5dc0b377238",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X       X       X X     X       ',
			ms: '  X   X     X         X     X   ',
			hs: '    X   X   X       X   X   X   ',
			re: 'r X   X r   X   r X XXr r   X XX',
			sn: '..X...X.....X.....X.XXX.....X.XX',
			ta: 'X X   X X   X XXX X   X X   X   ',
			ag: 'o a   a o   a     a   a o   a   ',
			sh: '................................'
		},
		'Yala Break': {
			ls: 'X X   X X   X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Kick Back 1': {
			loop: true,
			ls: 'X       X       X       X       X       X       X       X       ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X     X     X   X     X     X   X     X     X   X     X   ',
			sn: '@re',
			ta: '@re',
			ag: 'a a aaa a aaa aaa a aaa a aaa aao o ooo o ooo ooo o ooo o ooo oo',
			sh: '@re'
		},
		'Kick Back 2': {
			loop: true,
			ls: 'X       X       X       X X     ',
			ms: '@ls',
			hs: '@ls',
			re: '   X  X    X  X    X  X     X   ',
			sn: '   X  X    X  X    X  X     X ..',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 3': {
			ls: '    X       X       X X     X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: 'XXXX            XXXX    XXXX    ',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Hook Break': {
			ls: 'X X     X       X       X X     X   X   X   X   X       X       ',
			ms: '@ls',
			hs: '@ls',
			re: '   XXX    XXX XX  XXXXX     X XX  XX  XX  XX  XX  X   X     X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Yala Break", "Tune", "Tune", "Break 3", "Tune", "Tune", "Hook Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Tune", "Tune", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]]
};
