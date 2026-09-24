import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Crazy Monkey";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky" ],
	sheet: sheetUrl + "crazy-monkey.pdf",
	patterns: {
		Tune: {
			loop: true,
			time: 12,
			ls: 'X                       X                       X                       X     X  X              ',
			ms: '                  X                       X                       X     X     X  X        X     ',
			hs: '         X  X  X  X  X           X  X  X  X  X           X  X  X  X  X  X     X  X              ',
			re: 'f        h  X     X  X  f        h  X     X  X  f        h  X     X  X  X     X  X              ',
			sn: '.  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  X  .  X  X  .  .        ',
			ta: '      X  X        X        X     X        X           X  X        X        X     X              ',
			ag: 'o     a  a  a     o  o     a     a  a     o  o  o     a  a  a     o  o      a   a   a   a   a   ',
			sh: 'X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X     X  X              '
		},
		"Break 1": {
			ls: '        X XX            X XX          X X     X X   X   X XX    ',
			ms: '        X XX            X XX          X X     X X   X   X XX  X ',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: 'o aaa oo      o o aaa oo      o o aaa   o aaa   o aao aao       ',
			sh: '@ls'
		},
		"Break 2": {
			ls: '        X XX            X XX        X XX    X XX        X XX    ',
			ms: '        X XX            X XX        X XX    X XX        X XX  X ',
			hs: '@ls',
			re: '@ls',
			sn: '....X.XXX.XX........X.XXX.XX........X.XX....X.XX....X.XXX.XX    ',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		},
		"Break 3": {
			ls: 'X XX    X XX    X XXX XXX XX    ',
			ms: 'X XX    X XX    X XXX XXX XX  X ',
			hs: '@ls',
			re: '      X       X X XXX XXX XX    ',
			sn: '@re',
			ta: '@re',
			ag: '      X       X o aoo aoo oo  a ',
			sh: '@re'
		},
		"Bongo Break 1": {
			loop: true,
			ls: 'X   X   X   X   X   X   X XX    ',
			ms: '@ls',
			hs: '@ls',
			re: '   X  X  X X  X    X  X       X ',
			sn: '@re',
			ta: '@re',
			ag: 'o  ao a oa ao a o  ao a o oo  a ',
			sh: '@re'
		},
		"Bongo Break 2": {
			loop: true,
			ls: 'X   X   X   X   X   X   X XX  X ',
			ms: '@ls',
			hs: '@ls',
			re: 'X XX XX X XX XX X XX XX       X ',
			ta: '@re',
			ag: 'o  ao a oa ao a o  ao a o oo  a ',
			sh: '@re'
		},
		"Monkey Break": {
			ot: '(  (  ( )  )  ) '
		}
	},
	exampleSong: [[ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Bongo Break 1", "Bongo Break 1", "Bongo Break 2", "Bongo Break 2", "Monkey Break", "Tune", "Tune"]]
};
