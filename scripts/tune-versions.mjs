/**
 * Determines a per-tune version date from the git history: since each tune lives in its own folder
 * (assets/tunes/<tune-slug>/, holding its patterns.ts, descriptions and any other tune assets), a tune's
 * version is simply the date of the last commit that changed a file in its folder. Used by
 * generate-sheets.mjs for the page footers.
 *
 * Multiple tunes directories can be given: derived players copy their own tune folders into a clone of this
 * repo, so their change history is in their own repository — they pass their tunes directory (from a copy of
 * their repo that includes .git) in addition to (or instead of) the one of this repo. A tune folder that
 * exists in several directories (e.g. patterns in the derived player, descriptions from upstream) gets the
 * newest of its dates. Each directory's git repository is discovered independently via `git rev-parse`.
 *
 * Uncommitted changes count as changed today. If a directory is not inside a git repository (or the
 * repository is a shallow clone, which would yield wrong dates), a warning is printed and it is skipped.
 */

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(cwd, ...args) {
	const { stdout } = await execFileAsync("git", ["-C", cwd, ...args], { maxBuffer: 64 * 1024 * 1024 });
	return stdout;
}

/**
 * Returns a Map from tune folder name to the date (YYYY-MM-DD) of the last commit that changed a file in
 * that folder of the given tunes directory, with uncommitted changes counting as changed today.
 */
async function getFolderVersions(tunesDir, today) {
	let toplevel, prefix;
	try {
		toplevel = (await git(tunesDir, "rev-parse", "--show-toplevel")).trim();
		prefix = (await git(tunesDir, "rev-parse", "--show-prefix")).trim();
		if ((await git(tunesDir, "rev-parse", "--is-shallow-repository")).trim() === "true") {
			console.warn(`${tunesDir} is in a shallow git clone, cannot determine tune versions from it (fetch the full history, e.g. actions/checkout with fetch-depth: 0).`);
			return new Map();
		}
	} catch {
		console.warn(`${tunesDir} is not inside a git repository, cannot determine tune versions from it.`);
		return new Map();
	}

	const folderOf = (filePath) => {
		if (!filePath.startsWith(prefix)) {
			return undefined;
		}
		const subPath = filePath.slice(prefix.length);
		return subPath.includes("/") ? subPath.slice(0, subPath.indexOf("/")) : undefined;
	};

	const versions = new Map();

	// One log walk (newest first) over the whole directory instead of one `git log -1` call per tune
	const log = await git(toplevel, "log", "--format=#%cs", "--name-only", "--", prefix || ".");
	let date;
	for (const line of log.split("\n")) {
		if (line.startsWith("#")) {
			date = line.slice(1);
		} else if (line !== "") {
			const folder = folderOf(line);
			if (folder != null && !versions.has(folder)) {
				versions.set(folder, date);
			}
		}
	}

	// -uall lists untracked files individually (a fully untracked directory is otherwise collapsed
	// into a single "dir/" entry, which would not be attributable to a tune folder)
	const dirtyFolders = new Set();
	const status = await git(toplevel, "status", "--porcelain", "-uall", "--", prefix || ".");
	for (const line of status.split("\n").filter((line) => line !== "")) {
		// Rename lines look like "R  old -> new", make sure to catch both paths
		for (const filePath of line.slice(3).split(" -> ")) {
			const folder = folderOf(filePath);
			if (folder != null) {
				versions.set(folder, today);
				dirtyFolders.add(folder);
			}
		}
	}

	if (versions.size > 1 && dirtyFolders.size === versions.size) {
		// Every single tune folder is dirty or untracked, so every tune is stamped with today's date. This
		// usually means the directory does not match the repository's history (e.g. a derived player copying
		// its tunes folder under a different name than the one it is committed under).
		console.warn(`Every tune folder in ${tunesDir} has uncommitted changes, all tunes count as changed today. Does the path match the one in the repository's history?`);
	}
	return versions;
}

/**
 * Returns a Map from tune name to its version date (YYYY-MM-DD): the date of the last change to the tune's
 * folder (named like the tune's slug) in any of the given tunes directories. Tunes for which no date can be
 * determined are missing from the map.
 *
 * @param tunes An array of { name, slug } objects.
 * @param tunesDirs An array of tunes directory paths (each containing one folder per tune).
 */
export async function getTuneVersions(tunes, tunesDirs) {
	const today = new Date().toLocaleDateString("sv-SE"); // local date as YYYY-MM-DD
	const dirVersions = await Promise.all(tunesDirs.map((dir) => getFolderVersions(path.resolve(dir), today)));

	const versions = new Map();
	for (const tune of tunes) {
		const dates = dirVersions.map((folderVersions) => folderVersions.get(tune.slug)).filter((date) => date != null);
		if (dates.length > 0) {
			versions.set(tune.name, dates.sort().pop()); // ISO dates sort lexicographically
		}
	}
	return versions;
}
