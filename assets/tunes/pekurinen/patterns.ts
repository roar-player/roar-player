import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Pekurinen";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "pekurinen.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '    X       X X     X     X     ',
			ms: 'X       X       X       X       ',
			hs: 'X       X       X       X     X ',
			re: 'f XXX X XXX X XXf XXX X fXX X   ',
			sn: 'X...X.X..X..X.X.X...X.X..X..X...',
			ta: 'X XX  X XX  X XX  X XX   XX   X ',
			ag: 'a  o  a   o   a a  o  a  aa o   ',
			sh: '................................'
		},
		'Break 1': {
			ls: '        X X X   ',
			ms: '@ls',
			hs: '@ls',
			re: 'X XX Xf X X X   ',
			sn: '@ls',
			ta: '@ls',
			ag: '        o o o a ',
			sh: '@ls'
		},
		'Break 2': {
			ls: '                        X X X   ',
			ms: '@ls',
			hs: '@ls',
			re: '  XX XX   XX XX   XX XX X X X   ',
			sn: '@re',
			ta: '@re',
			ag: 'a       a       a       a a a   ',
			sh: '@re'
		},
		'Break 3': {
			ls: '                                                X X X X X   X   ',
			ms: '        XXX XXX         XXX XXX         XXX XXX             X   ',
			hs: '@ms',
			re: '@ms',
			sn: '@ms',
			ta: 'X X X X         X X X X         X X X X                     X   ',
			ag: '@ms',
			sh: '@ms'
		},
		'Clave Plus': {
			ls: 'X  X  X   XXX   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Disco Barricade Break': {
			ls: '                X  X  X   XXX   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: 'İ Ǐ İ Ǐ Ī ĨĮ Ĳ                  '
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: '                        X  X X  ',
			ms: '@ls',
			hs: '@ls',
			re: 'f XXXX r XXXX r X XX rr X  X X  ',
			sn: '@ls',
			ta: '       X      X      XX X  X X  ',
			ag: '       a      a      aa        a',
			sh: '@ls'
		}
	},
	exampleSong: [['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Clave Plus', 'Tune', 'Tune', 'Tune', 'Tune', 'Disco Barricade Break', 'Tune', 'Tune', 'Tune', 'Tune', 'Bra Break', 'Tune', 'Tune', 'Tune', 'Tune']]
};
