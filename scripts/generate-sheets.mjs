#!/usr/bin/env node
/**
 * Generates printable PDF tune sheets from the pattern definitions, using the #/sheet/ routes of the built app
 * (run `vite build` first). The sheets are generated in every language of the app (one per file in
 * assets/i18n/, i.e. the same list that the web UI language picker offers; texts that have no translation
 * fall back to English, just like in the web UI). For each tune and language, a single-tune A4 PDF is
 * generated, and all tunes are additionally combined into a per-language booklet with a cover page, a table
 * of contents, page numbers and PDF bookmarks.
 *
 * Output: dist/pdf/<tune-slug>.<lang>.pdf and dist/pdf/booklet.<lang>.pdf
 *
 * The sheets are rendered by headless Chromium. Puppeteer downloads a suitable browser during `yarn install`;
 * to use a system browser instead (e.g. in a Docker build), set PUPPETEER_SKIP_DOWNLOAD=1 during the install
 * and PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium when running this script.
 *
 * The booklet cover and the page footers can be customized through environment variables:
 * - SHEETS_TITLE: the title on the cover page and in the page footers (default: the app name, i.e. the HTML
 *   title of the build)
 * - SHEETS_SUBTITLE: the subtitle on the cover page (default: the localized booklet title, e.g. "Tune sheets")
 * - SHEETS_SOURCE: where the sheets were generated from, e.g. a player URL (shown on the cover page)
 * - SHEETS_LOGO: path to a PNG/JPEG logo shown on the cover page
 * - SHEETS_VERSION: a fixed version shown in all page footers. By default, each tune page instead shows a
 *   per-tune version: the date of the last change to the tune's folder according to the git history (see
 *   scripts/tune-versions.mjs), and the cover/contents pages show the newest of those dates.
 * - SHEETS_VERSION_TUNES: a colon-separated list of tunes directories whose git history determines the
 *   per-tune versions (default: assets/tunes). Derived players should point this at their own tunes
 *   directory inside a copy of their repository (including .git), so that the versions reflect their own
 *   change history — plus additionally at assets/tunes if they reuse tune folders (e.g. descriptions) from
 *   this repo.
 */

import { createServer } from "node:http";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { PDFDocument, PDFHexString, PDFName, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getTuneVersions } from "./tune-versions.mjs";

/**
 * Unicode font candidates for the cover/TOC text of the booklet (the tune pages themselves are rendered by the
 * browser and are not affected). If none of these exists, the PDF standard font Helvetica is used, which only
 * supports Latin-1-ish characters (unsupported characters are replaced with "?").
 */
const FONT_CANDIDATES = [
	["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"],
	["/usr/share/fonts/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"], // Alpine
	["/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]
];

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const outDir = path.join(distDir, "pdf");

const CONTENT_TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".json": "application/json",
	".png": "image/png",
	".gif": "image/gif",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webmanifest": "application/manifest+json"
};

/**
 * Additional directories to serve while rendering the sheets, as a colon-separated list in the
 * SHEETS_STATIC_DIRS environment variable. Each directory is served under its basename (e.g. /player/signs is
 * served as /signs/…). Use this for images that are referenced by the tune descriptions but are not part of
 * the build output. Note that animated GIFs appear as their first frame in the generated PDFs.
 */
const extraStaticDirs = (process.env.SHEETS_STATIC_DIRS ?? "").split(":").filter((dir) => dir !== "");

const titleOverride = process.env.SHEETS_TITLE;
const subtitleOverride = process.env.SHEETS_SUBTITLE;
const source = process.env.SHEETS_SOURCE;
const logoPath = process.env.SHEETS_LOGO;
const versionOverride = process.env.SHEETS_VERSION;
const versionTunesDirs = (process.env.SHEETS_VERSION_TUNES ?? path.join(rootDir, "assets", "tunes")).split(":").filter((dir) => dir !== "");
const today = new Date().toLocaleDateString("sv-SE"); // local date as YYYY-MM-DD

/** Serves the dist folder (and the SHEETS_STATIC_DIRS) on an ephemeral localhost port. */
async function serveDist() {
	const server = createServer((req, res) => {
		void (async () => {
			const urlPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
			let filePath = path.join(distDir, urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, ""));
			for (const dir of extraStaticDirs) {
				const prefix = `/${path.basename(dir)}/`;
				if (urlPath.startsWith(prefix)) {
					filePath = path.join(dir, urlPath.slice(prefix.length));
				}
			}
			try {
				const data = await readFile(filePath);
				res.writeHead(200, { "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream" });
				res.end(data);
			} catch {
				res.writeHead(404);
				res.end("Not found");
			}
		})();
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

/**
 * Returns the given text with emoji removed (the embedded fonts render them as placeholder boxes, e.g. in the
 * table of contents) and all other characters that cannot be encoded by the given font replaced with "?".
 * The PDF bookmarks are not affected, they keep the emoji.
 */
function encodableText(font, text) {
	return text.normalize("NFC")
		.replace(/\p{Extended_Pictographic}|\u{FE0F}|\u{200D}/gu, "")
		.replace(/\s+/g, " ")
		.trim()
		.split("")
		.map((char) => {
			try {
				font.widthOfTextAtSize(char, 10);
				return char;
			} catch {
				return "?";
			}
		})
		.join("");
}

/** Embeds a Unicode system font into the document, falling back to the standard font Helvetica. */
async function embedFonts(pdfDoc) {
	for (const [regularPath, boldPath] of FONT_CANDIDATES) {
		try {
			const [regular, bold] = await Promise.all([readFile(regularPath), readFile(boldPath)]);
			pdfDoc.registerFontkit(fontkit);
			return {
				font: await pdfDoc.embedFont(regular, { subset: true }),
				fontBold: await pdfDoc.embedFont(bold, { subset: true })
			};
		} catch {
			// Try the next candidate
		}
	}
	console.warn("No Unicode font found, non-Latin-1 characters on the booklet cover/contents pages will be replaced with '?'.");
	return {
		font: await pdfDoc.embedFont(StandardFonts.Helvetica),
		fontBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
	};
}

/** Adds a flat list of PDF bookmarks (one per tune) to the document. */
function addOutline(pdfDoc, items) {
	const context = pdfDoc.context;
	const outlineRef = context.nextRef();
	const itemRefs = items.map(() => context.nextRef());

	items.forEach((item, i) => {
		context.assign(itemRefs[i], context.obj({
			Title: PDFHexString.fromText(item.title),
			Parent: outlineRef,
			Dest: [pdfDoc.getPage(item.pageIndex).ref, PDFName.of("Fit")],
			...(i > 0 ? { Prev: itemRefs[i - 1] } : {}),
			...(i < items.length - 1 ? { Next: itemRefs[i + 1] } : {})
		}));
	});

	context.assign(outlineRef, context.obj({
		Type: "Outlines",
		First: itemRefs[0],
		Last: itemRefs[itemRefs.length - 1],
		Count: items.length
	}));
	pdfDoc.catalog.set(PDFName.of("Outlines"), outlineRef);
}

const PAGE_WIDTH = 595.28; // A4 portrait in points
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 42.52; // 15mm
const TOC_ENTRIES_PER_PAGE = 40;

/** Draws the sheet title, the page number and the version at the bottom of the page. */
function drawFooter(page, font, l10n, title, pageNumber, version) {
	// The footer text is localized (see the l10n collection in main()), with the placeholders replaced here
	const label = encodableText(font, l10n.footer
		.replaceAll("\u0001", title)
		.replaceAll("\u0002", String(pageNumber))
		.replaceAll("\u0003", String(version)));
	page.drawText(label, {
		x: (page.getWidth() - font.widthOfTextAtSize(label, 9)) / 2,
		y: 17,
		size: 9,
		font,
		color: rgb(0.3, 0.3, 0.3)
	});
}

/** Adds a title/page number/version footer to each page of a single-tune PDF. */
async function stampFooters(pdfBytes, l10n, title, version) {
	const doc = await PDFDocument.load(pdfBytes);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	doc.getPages().forEach((page, i) => {
		drawFooter(page, font, l10n, title, i + 1, version);
	});
	return await doc.save();
}

/** Combines the single-tune PDFs into a booklet with a cover page, table of contents, page numbers and bookmarks. */
async function generateBooklet(appName, tunes, rawPdfs, versionOf, bookletVersion, lang, l10n) {
	const singleDocs = [];
	for (const tune of tunes) {
		singleDocs.push(await PDFDocument.load(rawPdfs.get(tune.slug)));
	}

	const tocPageCount = Math.ceil(tunes.length / TOC_ENTRIES_PER_PAGE);

	// Calculate on which booklet page each tune will start (1-based; page 1 is the cover)
	let nextPage = 1 + tocPageCount + 1;
	const entries = tunes.map((tune, i) => {
		const startPage = nextPage;
		nextPage += singleDocs[i].getPageCount();
		return { ...tune, startPage, endPage: nextPage - 1 };
	});

	const booklet = await PDFDocument.create();
	const { font, fontBold } = await embedFonts(booklet);

	// Cover page
	const cover = booklet.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	if (logoPath) {
		const logoBytes = await readFile(logoPath);
		const logo = /\.png$/i.test(logoPath) ? await booklet.embedPng(logoBytes) : await booklet.embedJpg(logoBytes);
		const scale = Math.min(150 / logo.height, 300 / logo.width);
		const logoWidth = logo.width * scale;
		const logoHeight = logo.height * scale;
		cover.drawImage(logo, {
			x: (PAGE_WIDTH - logoWidth) / 2,
			y: PAGE_HEIGHT / 2 + 110,
			width: logoWidth,
			height: logoHeight
		});
	}
	const title = titleOverride ?? appName;
	const coverTitle = encodableText(fontBold, title);
	cover.drawText(coverTitle, {
		x: (PAGE_WIDTH - fontBold.widthOfTextAtSize(coverTitle, 32)) / 2,
		y: PAGE_HEIGHT / 2 + 60,
		size: 32,
		font: fontBold
	});
	const coverSubtitle = encodableText(font, subtitleOverride ?? l10n.subtitle);
	cover.drawText(coverSubtitle, {
		x: (PAGE_WIDTH - font.widthOfTextAtSize(coverSubtitle, 20)) / 2,
		y: PAGE_HEIGHT / 2 + 20,
		size: 20,
		font
	});
	const generatedLine = encodableText(font, l10n.generated);
	cover.drawText(generatedLine, {
		x: (PAGE_WIDTH - font.widthOfTextAtSize(generatedLine, 10)) / 2,
		y: PAGE_HEIGHT / 2 - 20,
		size: 10,
		font
	});

	// Table of contents
	for (let tocPage = 0; tocPage < tocPageCount; tocPage++) {
		const page = booklet.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
		let y = PAGE_HEIGHT - PAGE_MARGIN;
		if (tocPage === 0) {
			page.drawText(encodableText(fontBold, l10n.contents), { x: PAGE_MARGIN, y: y - 16, size: 16, font: fontBold });
			y -= 40;
		}
		for (const entry of entries.slice(tocPage * TOC_ENTRIES_PER_PAGE, (tocPage + 1) * TOC_ENTRIES_PER_PAGE)) {
			const title = encodableText(font, entry.displayName);
			const pageLabel = String(entry.startPage);
			page.drawText(title, { x: PAGE_MARGIN, y: y - 11, size: 11, font });
			page.drawText(pageLabel, {
				x: PAGE_WIDTH - PAGE_MARGIN - font.widthOfTextAtSize(pageLabel, 11),
				y: y - 11,
				size: 11,
				font
			});
			y -= 17;
		}
	}

	// Tune pages
	for (const doc of singleDocs) {
		for (const copied of await booklet.copyPages(doc, doc.getPageIndices())) {
			booklet.addPage(copied);
		}
	}

	// Title/page number/version footers (all pages except the cover); tune pages show the version of
	// their tune, the contents pages show the booklet-wide version
	const pages = booklet.getPages();
	for (let i = 1; i < pages.length; i++) {
		const pageNumber = i + 1;
		const entry = entries.find((entry) => entry.startPage <= pageNumber && pageNumber <= entry.endPage);
		drawFooter(pages[i], font, l10n, title, pageNumber, entry != null ? versionOf(entry) : bookletVersion);
	}

	addOutline(booklet, entries.map((entry) => ({ title: entry.displayName, pageIndex: entry.startPage - 1 })));

	await writeFile(path.join(outDir, `booklet.${lang}.pdf`), await booklet.save());
}

async function main() {
	await mkdir(outDir, { recursive: true });

	// One set of sheets is generated per app language (see the language picker of the web UI); texts
	// without a translation fall back to English through the app's usual i18n fallback
	const langs = (await readdir(path.join(rootDir, "assets", "i18n")))
		.filter((file) => file.endsWith(".json"))
		.map((file) => file.slice(0, -".json".length))
		.sort();

	const { server, url } = await serveDist();
	const browser = await puppeteer.launch({
		// --no-sandbox is required when running as root (e.g. in a Docker build)
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"]
	});

	try {
		const page = await browser.newPage();
		page.setDefaultTimeout(120000);

		let versionOf, bookletVersion;
		for (const lang of langs) {
			await page.goto(`${url}?lang=${encodeURIComponent(lang)}#/sheet/`, { waitUntil: "load" });
			await page.waitForSelector(".bb-sheet");
			const appName = await page.title();
			const tunes = await page.evaluate(() => window.bbSheetIndex);
			if (!tunes?.length) {
				throw new Error("No tunes found (window.bbSheetIndex is empty).");
			}

			if (!versionOf) {
				// The versions are language-independent, compute them only once
				const tuneVersions = versionOverride != null ? new Map() : await getTuneVersions(tunes, versionTunesDirs);
				versionOf = (tune) => versionOverride ?? tuneVersions.get(tune.name) ?? today;
				bookletVersion = versionOverride ?? [...tuneVersions.values()].sort().pop() ?? today;
			}

			// The localized texts for the parts of the PDFs that are not rendered by the browser (booklet
			// cover, table of contents, page footers). The footer placeholders are substituted in drawFooter().
			const l10n = await page.evaluate((source) => ({
				subtitle: window.bbTranslate("sheet.booklet-title"),
				generated: source != null
					? window.bbTranslate("sheet.generated-source", { source })
					: window.bbTranslate("sheet.generated", { appName: document.title }),
				contents: window.bbTranslate("sheet.contents"),
				footer: window.bbTranslate("sheet.footer", { title: "\u0001", page: "\u0002", version: "\u0003" })
			}), source ?? null);

			const rawPdfs = new Map();
			for (const tune of tunes) {
				console.log(`Generating sheet for ${tune.name} (${tune.slug}.${lang}.pdf)...`);
				await page.evaluate((tuneName) => {
					location.hash = `#/sheet/${encodeURIComponent(tuneName)}`;
				}, tune.name);
				await page.waitForFunction((tuneName) => {
					const sheet = document.querySelector(".bb-sheet-single");
					return sheet != null && sheet.getAttribute("data-tune-name") === tuneName && sheet.querySelector(".bb-sheet-tune") != null;
				}, {}, tune.name);
				rawPdfs.set(tune.slug, await page.pdf({
					preferCSSPageSize: true,
					printBackground: true
				}));
			}

			// The footers are stamped into the single PDFs only after the booklet has copied their pages,
			// so that the booklet pages get their booklet-wide page numbers instead
			console.log(`Generating booklet.${lang}.pdf...`);
			await generateBooklet(appName, tunes, rawPdfs, versionOf, bookletVersion, lang, l10n);
			for (const tune of tunes) {
				await writeFile(path.join(outDir, `${tune.slug}.${lang}.pdf`), await stampFooters(rawPdfs.get(tune.slug), l10n, titleOverride ?? appName, versionOf(tune)));
			}

			console.log(`Generated ${tunes.length} tune sheets and the booklet for language ${lang}.`);
		}

		console.log(`Generated the tune sheets and booklets for ${langs.length} languages (${langs.join(", ")}) in ${outDir}.`);
	} finally {
		await browser.close();
		server.close();
	}
}

await main();
