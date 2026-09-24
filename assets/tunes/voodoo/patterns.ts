import { RawTune, sheetUrl } from "../helpers";

export const tuneName = "Voodoo";

export const tune: RawTune = {
	categories: [ "uncommon", "easy", "cultural-appropriation" ],
	sheet: sheetUrl + "voodoo.pdf",
	patterns: {
		Tune: {
			loop: true,
			ls: '   XX 0    XX 0    XX 0 X X X 0 ',
			ms: 's   s X s   s X s   s X s   s X ',
			hs: '@ms',
			re: 'X  X  X X  X  X X  X  X X  X  X ',
			sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
			ta: 'X X X X X X X X XX              ',
			ag: 'a a o o oa a oo a a o o oa a oo ',
			sh: 'X.......X.......X.......X.......'
		},
		'Scissor Break': {
			ls: 'X X X X XX X XX ',
			ms: '@ls',
			hs: '@ls',
			re: '@ls',
			sn: '@ls',
			ta: '@ls',
			ag: '@ls',
			sh: '@ls'
		}
	},
	exampleSong: [[ "Tune", "Tune", "Scissor Break", "Tune", "Tune" ]]
};
