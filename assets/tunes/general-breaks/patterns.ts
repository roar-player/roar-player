import { RawTune, repeat, crescendo, decrescendo, sheetUrl } from "../helpers";

export const tuneName = "General Breaks";

export const tune: RawTune = {
	sortPriority: 1,
	categories: [ "common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation" ],
	sheet: sheetUrl + "breaks.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
	patterns: {
		"Karla Break": {
			ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
		},
		"8 up": {
			ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: crescendo(32)
		},
		"8 down": {
			ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: decrescendo(32)
		},
		"Clave": {
			ls: 'X  X  X   X X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		"Clave 4x": {
			displayName: "Clave 4× soft to loud",
			ls: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
		},
		'Clave Inverted': {
			ls: '  X X   X  X  X ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Progressive': {
			ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXX',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Progressive Inverted': {
			ls: 'XXXXXXXXXXXXXXXXX X X X X X X X X   X   X   X   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Progressive Karla': {
			ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'4 Silence': {
			ls: repeat(16, ' ')
		},
		'8 Silence': {
			ls: repeat(32, ' ')
		},
		'12 Silence': {
			ls: repeat(48, ' ')
		},
		'16 Silence': {
			ls: repeat(64, ' ')
		},
		'Boom Break': {
			ls: 'X               ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
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
		"Whistle in": {
			ot: 'y   y   y   y   '
		}
	}
};
