import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "March for Biodiversity";

export const tune: RawTune = {
	categories: [ "uncommon", "tricky", "western" ],
	sheet: sheetUrl + "march-for-biodiversity.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: 'X X X X XXX XXX X X X X XXX XXX X X X X XXX XXX X X X X X   X   ',
			ms: 's s s s         s s s s         s s s s         s s s s X   X   ',
			hs: '        XXX XXX         XXX XXX         XXX XXX         X   X   ',
			re: 'f r   rrf r  r  f r   rrf r  r  f r   rrf r  r  f r   rrf X  s  ',
			sn: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . ',
			ta: '    X  X  X XX  X  X  X  XX XXX     X  X  X XX  X  X  X  XX XXX ',
			ag: 'o   o   o a aa  o a aa  o   o   a   a   a o oo  o o o o o   a   ',
			sh: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . '
		},
		Intro: {
			ls: 's   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s        X X XX ',
			ms: '                               X   X   X   X   X   X   X   X   X   X   X   X   X         X X XX ',
			hs: '                             X   X   X   X   X   X   X   X   X   X   X   X   X   X       X X XX ',
			re: '  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX         X X XX ',
			sn: '                                                         f   f   f   f   f   f   f ....X X X XX ',
			ta: '                                                        X   X   X   X   X   X   X        X X XX ',
			ag: '                                                aao         aao             aao          a a aa '
		},
		'Break 1': {
			ls: 'rrr X XXr rrX   ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: 'rrr o oor rro a '
		},
		'Break 2': {
			ls: 'X X X X X       ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls',
			ot: '          F     '
		}
	},
	exampleSong: [['Intro', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune']]
};
