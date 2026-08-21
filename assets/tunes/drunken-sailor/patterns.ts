import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Drunken Sailor";

export const tune: RawTune = {
	categories: [ "uncommon", "medium", "western" ],
	sheet: sheetUrl + "drunken-sailor.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/00dd3ac1-a872-49ea-aec1-8c8ebc8f334e",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X   X   X X     X   X   X X     X   X   X X             X   X   ',
			ms: 'X   X   X   X   X   X   X   X   X   X   X   X       X X         ',
			hs: 'X   X   X     X X   X   X     X X   X   X     X X X             ',
			re: 'f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r ',
			sn: 'X..XX..XX.......X..XX..XX.X.X.X.X..XX..XX.......X..XX..XX.X.X.X.',
			ta: 'XX      X X X   XX      X X X   XX      X X X   XX      X X X   ',
			ag: 'o oao oao o a o o oao oao o a o o oao oao o a o o oao oao o a o ',
			sh: '................................................................'
		},
		'Break 1': {
			ls: 'X X XX  X   X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Break 2': {
			ls: 'X   X   X   XXX ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X   X XXX ',
			sn: '@re',
			ta: '@re',
			ag: '@re'
		},
		'White Shark': {
			ls: 'X               X       X               X       X       X       X   X   X   X   X   X   X   X   X   X   X   X   X       X       ',
			ms: '@ls',
			hs: '@ls',
			re: '   X               X       X               X       X       X      X   X   X   X   X   X   X   X   X   X   X   X   X     X       ',
			sn: '@re',
			ta: '@re',
			ag: '                                                                                ooa         ooa ooa         ooa                 '
		}
	},
	exampleSong: [[ "Tune", "Break 1", "Tune", "Break 2", "Tune", "White Shark", "Tune" ]]
};
