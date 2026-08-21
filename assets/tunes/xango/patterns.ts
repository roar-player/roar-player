import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Xango";

export const tune: RawTune = {
	displayName: "Xangô",
	categories: [ "uncommon", "tricky", "cultural-appropriation" ],
	sheet: sheetUrl + "xango.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/ae1fe3a3-dd7e-4670-9415-b47ee60a54b0",
	patterns: {
		Tune: {
			loop: true,
			ls: repeat(2, 's   X XX        '),
			ms: repeat(2, 'X X             '),
			hs: repeat(2, '            XXXX'),
			re: repeat(2, ' XXX XXX XXX XXX'),
			sn: repeat(2, 'X..X....X.XX....'),
			ta: 'X X X X X X X X XX              ',
			ag: repeat(2, 'o a o  o o ao   '),
			sh: repeat(2, '................')
		},
		'Intro': {
			loop: true,
			re: repeat(4, 'r rrr r r r r r '),
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Intro+Surdos': {
			loop: true,
			ls: 'X         X X X X           X X X       X X X X X           X   ',
			ms: '@ls',
			hs: '@ls',
			re: repeat(4, 'r rrr r r r r r '),
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Boum Shakala Break': {
			ls: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X                 ',
			ms: '@ls',
			hs: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X             XXXX',
			re: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X                 ',
			sn: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X X..X..XXX       ',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		},
		'Break 2': {
			ls: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   ',
			ms: '@ls',
			hs: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX XX',
			re: '                         X XX                            X XX                            X XX   ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re'
		}
	},
	exampleSong: [[ "Intro", "Intro", "Intro+Surdos", "Intro+Surdos", "Tune", "Tune", "Boum Shakala Break", "Tune", "Tune", "Break 2", "Tune", "Tune" ]]
};
