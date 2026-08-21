import type { Plugin } from "rollup";
import glob from "fast-glob";
import { readFile } from "fs/promises";
import { promisify } from "util";
import { deflateRaw } from "zlib";
import { relative } from "path";

export default function audioFilesPlugin(): Plugin {
	return {
		name: 'virtual:audioFiles',
		resolveId: (id) => {
			if (id === 'virtual:audioFiles') {
				return id;
			}
		},
		load: async (id) => {
			if (id === 'virtual:audioFiles') {
				var binaries: Record<string, string> = {};

				// Keyed by the path relative to assets/ (e.g. "instruments/ls/58.mp3"), see src/services/player.ts
				for (const path of await glob("./assets/**/*.mp3")) {
					const content = await readFile(path);
					const compressed = await promisify(deflateRaw)(content);
					binaries[relative("assets", path).replaceAll("\\", "/")] = compressed.toString("base64");
				};

				return `export default ${JSON.stringify(binaries, undefined, "\t")};`;
			}
		}
	}
}