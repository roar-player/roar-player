import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Sheffield Samba Reggae";

export const tune: RawTune = {
	categories: [ "uncommon", "medium", "cultural-appropriation" ],
	sheet: sheetUrl + "sheffield-samba-reggae.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '    X X     XXXX    X X     XXXX    X X     XXXX    X X     XXXX',
			ms: 'X       X       X       X       X       X       X       X       ',
			hs: '    X X     X X     X X X X XXXX    X X     X X     X X X X XXXX',
			re: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
			sn: '@re',
			ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
			ag: repeat(4, '  a o o aa oa o '),
			sh: '................................................................'
		},
		'Intro': {
			ls: '                           XX X X             X X             X X             X XX X X X    X X ',
			ms: '@ls',
			hs: '@ls',
			re: 'X X X X X  XXXXXX X X X X          fXX X fXXX      fXX X fXXX      fXX X fXXX            fXX    ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Break 1': {
			loop: true,
			ls: 'X               X               X               X               ',
			ms: '@ls',
			hs: '@ls',
			re: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
			sn: '@re',
			ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
			ag: repeat(4, '  a o o aa oa o '),
			sh: '................................................................'
		},
		'Break 2': {
			ls: 'X               X             X X               X               ',
			ms: '@ls',
			hs: '@ls',
			re: 'XXrXXXrXXXrXX r XXrXXXrXXXrXX r XXrXXXrXXXrXXXrXX X X X fXX X X ',
			sn: '@re',
			ta: '  X   X   X   X   X   X   X   X   X   X   X   XXX X X X     X X ',
			ag: '@ta',
			sh: '@ta'
		},
		'Break 3': {
			ls: 'X  X  X         X  X  X         ',
			ms: '@ls',
			hs: '@ls',
			re: '        X  X  X         XXXXX X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Whistle Break': {
			loop: true,
			ls: 'X  XX  XXX XX   ',
			ms: '@ls',
			hs: '@ls',
			re: '  X   X   X   X ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Outro': {
			upbeat: 2,
			ls: 'X XX X X X      X X               ',
			ms: '@ls',
			hs: '@ls',
			re: 'X XX X X X fXXX X X               ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Whistle Break", "Tune", "Outro" ]]
};
