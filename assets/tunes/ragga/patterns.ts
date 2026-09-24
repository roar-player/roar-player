import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Ragga";

export const tune: RawTune = {
	categories: [ "common", "tricky" ],
	sheet: sheetUrl + "ragga.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/bb2a4cd6-021b-4596-9917-f53bed8363a8",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X  X  0 X  X  0 X  X  0 X  X  0 ',
			ms: '0  X  X 0  X  X 0  X  X 0  X  X ',
			hs: '0     X 0     X 0     X 0     X ',
			re: '  X   X   X   X   X   X  XXX  X ',
			sn: '..XX..X...XX..X...XX..X...XX..X.',
			ta: '  X   X   X   X   X   X   XX  X ',
			ag: 'o a o a oa ao a o a  oooo a o   ',
			sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
		},
		'Kick Back 1': {
			loop: true,
			ls: 'X  X    X  X    X  X    X  X    ',
			ms: '@ls',
			hs: '@ls',
			re: '      X       X       X       X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Kick Back 2': {
			loop: true,
			ls: 'X  X X  X  X X  X  X X  X  X X  ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X   X   X   X   X   X   X ',
			sn: '@re',
			ta: '@re',
			ag: 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa',
			sh: '@re'
		},
		'Break 2': {
			ls: 'X           XXX ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Break 3': {
			ls: 'X  X  X         ',
			ms: '@ls',
			hs: '@ls',
			re: '        X  X  X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Zorro-Break': {
			loop: true,
			ls: 'X       X       X       X  X  X ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X   X   X   X   X  XXX  X ',
			sn: '..XX..X...XX..X...XX..X...XX..X.',
			ta: '  X   X   X   X   X   X   XX  X ',
			ag: 'o a o a oa ao a o a  oooo a o   ',
			sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune", "Zorro-Break", "Zorro-Break", "Tune", "Tune" ]]
};
