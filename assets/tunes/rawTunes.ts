import { stretch, repeat, crescendoByBlocks, sheetUrl } from "./tuneHelpers";
import type { Tune } from "../../src/state/tune";
import { compressedPatternValidator } from "../../src/state/pattern";
import * as z from "zod";

/** The current tune of the year. It will be opened by default when the app is opened. If multiple tunes are specified, one of them will be randomly picked each time. */
export const tuneOfTheYear: string | string[] = "Afoxe";

type RawTune = Partial<Omit<Tune, 'patterns'>> & {
	patterns: Record<string, z.input<typeof compressedPatternValidator>>;
	time?: number;
};

export const rawTunes: { [tuneName: string]: RawTune } = {
	'General Breaks': {
		categories: ["common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation"],
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
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
			},
			"Whistle in": {
				ot: 'y   y   y   y   '
			},
		}
	},
	"Afoxe": {
		displayName: "Afoxé",
		categories: ["common", "medium", "cultural-appropriation"],
		sheet: sheetUrl + "afoxe.pdf",
		descriptionFilename: "afoxe",
		patterns: {
			"Tune": {
				loop: true,
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '0     X 0     X 0     X X X X X ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Break 1": {
				ls: 'X       X       X       X XXXXX ',
				ms: '@ls',
				hs: '@ls',
				re: '   XXXX    XXXX    XXXX X XXXXX ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			"Break 2": {
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '      X       X       X   XXXXX ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Break 3": {
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '   XXXX    XXXX    XXXX X XXXXX ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Bra Break": {
				displayName: "Call Break",
				ls: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: 'X X X           X X X           X X X           X X X X XX XX X ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Tamborim Stroke": {
				ls: 'X X X X XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tamborim Stroke"]
	},
};
