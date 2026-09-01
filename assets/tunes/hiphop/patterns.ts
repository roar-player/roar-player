import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Hip Hop";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "hiphop.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X X    X  X     X X    X  X   s ',
			ms: 'X X    X        X X    X        ',
			hs: 'X X      XX     X X      XX     ',
			re: 'f   X       X   f   X       X h ',
			sn: 'XX..X..X....X...XX..X..X....X...',
			ta: '    X  X  X X       X    XX X   ',
			ag: 'o o a  o  o a   o o a    oo a   ',
			sh: 'X...X...X...X...X...X...X...X...'
		},
		'Kick Back 1': {
			loop: true,
			ls: 'X      X  X     ',
			ms: '@ls',
			hs: '@ls',
			re: '    X       X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Kick Back 2': {
			loop: true,
			ls: 'X X    X XX     ',
			ms: '@ls',
			hs: '@ls',
			re: '    X       X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 1': {
			ls: 'X      X X X    ',
			ms: '@ls',
			hs: '@ls',
			re: '    X       X   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Tune", { patternName: "Tune", length: 4 }, "Break 1", "Tune", "Tune" ]]
};
