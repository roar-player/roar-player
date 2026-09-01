import { RawTune, repeat, crescendo, sheetUrl } from "../helpers";

export const tuneName = "Special Breaks";

export const tune: RawTune = {
	sortPriority: 2,
	categories: [ "common", "onesurdo" ],
	sheet: sheetUrl + "breaks.pdf",
	video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
	patterns: {
		"Call Break Oi": {
			displayName: 'Oi Break',
			time: 3,
			ls: 'X  XXXX     ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '         A  '
		},
		"Call Break Ua": {
			displayName: 'Ua Break',
			time: 3,
			ls: 'X  XXXX     ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '         B  '
		},
		'Star Wars': {
			ls: '            X       X           ',
			ms: 'X   X   X       X       X       ',
			hs: '               X       X        '
		},
		'Star Wars Extended': {
			ls: '            X       X                               X           ',
			ms: 'X   X   X       X       X                       X       X       ',
			hs: '               X       X                       X       X        ',
			re: '                                X   X   X                       ',
			ta: '                                            X                   '
		},
		'Star Wars Extended Extended': {
			ls: '            X       X                               X                                                 X     X       X           ',
			ms: 'X   X   X       X       X                       X       X           X  X              X                         X       X       ',
			hs: '               X       X                       X       X                                                       X       X        ',
			re: '                                X   X   X                                                                                       ',
			sn: '@re',
			ta: '                                            X                                                   XXX     X                       ',
			ag: '                                                                a       a   a  aooo     o   o  o                                '
		},
		"Wulf Break": {
			ls: 'X X   XXX X    XX X    XX X     X X   XXX X    XX X X X X       ',
			ms: '@ls',
			hs: '@ls',
			re: '    X       X       X       X       X       X  XX X X X X       ',
			sn: '@re',
			ta: '@re',
			ag: '@re',
			sh: '@re',
			ot: '                                                          E D   '
		},
		'Hardcore Break': {
			ls: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') +
				repeat(1, 'X   X   X   X XXX   X   X   X XXX   X   X   X XXX   X   XXXXXXXX') +
				repeat(1, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
			ms: '@ls',
			hs: '@ls',
			re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') +
				repeat(1, 'X   X   X   X XXX   X   X   X XXX   X   X   X XXX   X   XXXXXXXX') +
				repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
			sn: '@re',
			ta: '@re',
			ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') +
				repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
			sh: '@re',
		},
		'Hard Core Break': {
			displayName: "Hardcore Break (original)",
			ls: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') + repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
			ms: '@ls',
			hs: '@ls',
			re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') + repeat(3, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
			sn: '@re',
			ta: '@re',
			ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') + repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
			sh: '@re',
			volumeHack: {
				ls: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				ms: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				hs: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				re: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				sn: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				ta: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
				sh: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 }
			}
		},
		'Nellie the Elephant Break': {
			ls: '            X X             X X             X X XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, 'X  X  X         ') + 'X           XXX ',
			ms: '@ls',
			hs: '@ls',
			re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, '        X  X  X ') + 'X           XXX ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '                                                                                                ' + repeat(2, 'DDDDDDDDDDDDDDDD') + repeat(3, '                ') + '                ',
			volumeHack: Object.assign({ 48: .2, 64: .6, 80: 1, 128: .2, 144: .6, 160: 1 }, crescendo(32, 96))
		},
		'Super Mario Break': {
			ls: '     X          ',
			ms: 'XX X  X         ',
			hs: '        X       ',
			ag: '            o   '
		},
		'Punky Monkey Break': {
			ot: 'DDEEDDEEA A A   '
		}
	}
};
