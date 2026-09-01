import { RawTune, repeat, sheetUrl } from "../helpers";

export const tuneName = "Zurav Love / Truant";

export const tune: RawTune = {
	displayName: "Żurav Love",
	categories: [ "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "zurav-love.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X  X  X  X  X  X                ',
			ms: '@ls',
			hs: '                        X  X  X ',
			re: 'f   h X f   h   f   h X f   h   ',
			sn: 'X...X...X...X.....XXX...XXX.X...',
			ta: '    X       X       X       X   ',
			ag: '  aaa o aaa o     aaa           ',
			sh: '...XX......XX......XX......XX...'
		},
		"Bra Break": {
			displayName: "Call Break",
			ls: repeat(3, '        X       ') + 'X     X X  X  X ',
			ms: '@ls',
			hs: '@ls',
			re: repeat(3, 'f hr hr         ') + 'X     X X  X  X ',
			sn: repeat(3, '                ') + '..XXX...XXX.X...',
			ta: repeat(3, '           X  X ') + 'X     X X  X  X ',
			ag: '@ta',
			sh: '@ta'
		},
		"Kick Back 1": {
			loop: true,
			ls: '            X   ',
			ms: '@ls',
			hs: '@ls',
			re: '  XXX   XXX     ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		"Kick Back 2": {
			loop: true,
			ls: '    X       X   ',
			ms: '@ls',
			hs: '@ls',
			re: '  XXX   XXX     ',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Bra Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]]
};
