import { RawTune, crescendo, sheetUrl } from "../helpers";

export const tuneName = "Van Harte Pardon";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "van-harte-pardon.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '0     XX0     X 0     XX0   X X ',
			ms: '@ls',
			hs: 's  X    s  X    s  X    ss sX   ',
			re: '  X   X  X X  X   X   X  X X  X ',
			sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
			ta: '  X   X  X X  X   X   X  X X  X ',
			ag: 'a.ooo.aa.o.oo.ooo.aaa.oo.a.aa.oo',
			sh: '................................'
		},
		'Break 1': {
			ls: '                XX XX XX        ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: 'J           L               F   '
		},
		'Silence Break': {
			ls: '              XX',
			ag: '@ls'
		},
		'Break 2': {
			ls: 'X  s          X X  s          X ',
			hs: 'X  s            X  s            ',
			re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
			sn: '@re',
			ta: '      XXXX XX X       XXXX XX   ',
			ag: '      aaaa oa a       oooo ao   '
		},
		'Break 2 (Cut)': {
			ls: 'X  s          X X  s  ssss sX X ',
			hs: 'X  s            X  s  ssss sX   ',
			re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
			sn: '@re',
			ta: '      XXXX XX X       XXXX XX   ',
			ag: '      aaaa oa a       oooo ao   '
		},
		'Cross Break': {
			ls: 'X  s          X X  s          X ',
			hs: 'X  s            X  s            '
		},
		'Cross Eight Break': {
			ls: 'X X X X X X X X ',
			ms: '@ls',
			hs: '@ls',
			volumeHack: crescendo(16)
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Silence Break", "Tune", "Tune", "Break 2", "Break 2 (Cut)", "Tune", "Tune", "Cross Break", "Tune", "Tune", "Cross Eight Break", "Tune", "Tune" ]]
};
