import { RawTune, crescendo, sheetUrl } from "../helpers";

export const tuneName = "No Border Bossa";

export const tune: RawTune = {
	categories: [ "uncommon", "onesurdo", "medium" ],
	sheet: sheetUrl + "no-border-bossa.pdf",
	patterns: {
		Tune: {
			loop: true,
			upbeat: 2,
			ls: 's s   h X X   h s s   h X X X h s s   h X X   h s s   h X   X h s ',
			ms: '@ls',
			hs: '@ls',
			re: '    X r   fh fh f   X r   fh fh f   X r   fh fh f   X r   fh fh f ',
			sn: '  X..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..X',
			ta: '    X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X ',
			ag: '  a a . o o o . a a a . o o o . a a a . o o o . a a a . o o o . a ',
			sh: '@sn'
		},
		'Break 1': {
			ls: '  X X   X  X  X   X X   XX XX   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		'Break 2': {
			upbeat: 2,
			ls: 's s     s s     s s     s s     s ',
			ms: '@ls',
			hs: '@ls',
			re: '    X r   fh fh f   X r   fh fh f ',
			sn: '  X..XX..XX..XX..XX..XX..XX..XX..X',
			ta: '    X X   X  X  X   X X   X  X  X ',
			ag: '  a a . o o o . a a a . o o o . a ',
			sh: '@sn'
		},
		'Break 2*': {
			upbeat: 2,
			ls: 's s     s s     s s     s s     s ',
			ms: '@ls',
			hs: '@ls',
			re: '    X r   fh fh f   X r   fh fh f ',
			sn: '  X..XX..XX..XX..XX..XX..XX..XX..X',
			ta: '    X X   X  X  X   X X   X  X  X ',
			ag: '  a a . o o o . a a a . o o o . a ',
			volumeHack: {
				ls: crescendo(32),
				ms: crescendo(32),
				hs: crescendo(32)
			}
		},
		'Bra Break': {
			displayName: "Call Break",
			ls: '                        XX XX   ',
			ms: '@ls',
			hs: '@ls',
			re: 'X X X   X  X  X   X X           ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Tune", "Break 1", "Tune", "Bra Break", "Tune" ]]
};
