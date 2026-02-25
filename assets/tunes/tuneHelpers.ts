import type { AllVolumeHack } from "../../src/state/pattern";

export function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([ "" ]).join(repeat((to/from)-1, " "));
}

export function repeat(n: number, pattern: string): string {
	let ret = "";
	for(let i=0; i<n; i++)
		ret += pattern;
	return ret;
}

export function crescendo(length: number, start: number = 0): AllVolumeHack {
	const r: AllVolumeHack = { };
	const a = .05;
	const b = (1-a)/(length-1);
	for(let i=0; i<length; i++)
		r[start+i] = a+b*i;
	return r;
}

export function crescendoByBlocks(numBlocks: number, blockLength: number, start: number = 0): AllVolumeHack {
	const ret: AllVolumeHack = { };
	const lowVolume = 0.1;
	const volumeIncrement = (1-lowVolume)/(numBlocks-1);
	for(let i = 0; i < blockLength*numBlocks; i++) {
		ret[start+i] = lowVolume + volumeIncrement * Math.floor(i / blockLength);
	}
	return ret;
}

export function decrescendo(length: number): AllVolumeHack {
	const r: AllVolumeHack = { };
	const b = 0.95/(length-1);
	for(let i=0; i<length; i++)
		r[i] = 1-b*i;
	return r;
}

export function decrescendoByBlocks(numBlocks: number, blockLength: number, start: number = 0): AllVolumeHack {
	const ret: AllVolumeHack = { };
	const lowVolume = 0.1;
	const volumeIncrement = (1-lowVolume)/(numBlocks-1);
	for(let i = 0; i < blockLength*numBlocks; i++) {
		ret[start+i] = 1 - volumeIncrement * Math.floor(i / blockLength);
	}
	return ret;
}

export const sheetUrl = "https://github.com/rhythms-of-resistance/sheetbook/blob/master/generated/single/";
