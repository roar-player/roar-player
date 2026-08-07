#!/usr/bin/env node
/**
 * Generates printable PDF tune sheets from the pattern definitions, using the #/sheet/ routes of the built app
 * (run `vite build` first). For each tune, a single-tune A4 PDF is generated, and all tunes are additionally
 * combined into a booklet with a cover page, a table of contents, page numbers and PDF bookmarks.
 *
 * Output: dist/pdf/<tune-slug>.pdf and dist/pdf/booklet.pdf
 *
 * The sheets are rendered by headless Chromium. Puppeteer downloads a suitable browser during `yarn install`;
 * to use a system browser instead (e.g. in a Docker build), set PUPPETEER_SKIP_DOWNLOAD=1 during the install
 * and PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium when running this script.
 *
 * The booklet cover and the page footers can be customized through environment variables:
 * - SHEETS_TITLE: the title on the cover page (default: the app name, i.e. the HTML title of the build)
 * - SHEETS_SUBTITLE: the subtitle on the cover page (default: "Tune sheets")
 * - SHEETS_SOURCE: where the sheets were generated from, e.g. a player URL (shown on the cover page)
 * - SHEETS_LOGO: path to a PNG/JPEG logo shown on the cover page
 * - SHEETS_VERSION: the version shown on the cover page and in the page footers (default: today's date)
 */

import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { PDFDocument, PDFHexString, PDFName, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

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
const subtitle = process.env.SHEETS_SUBTITLE ?? "Tune sheets";
const source = process.env.SHEETS_SOURCE;
const logoPath = process.env.SHEETS_LOGO;
const version = process.env.SHEETS_VERSION ?? new Date().toLocaleDateString("sv-SE"); // local date as YYYY-MM-DD

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

/** Draws the page number and the version at the bottom of the page. */
function drawFooter(page, font, pageNumber) {
	const label = `Page ${pageNumber} · Version ${version}`;
	page.drawText(label, {
		x: (page.getWidth() - font.widthOfTextAtSize(label, 9)) / 2,
		y: 17,
		size: 9,
		font,
		color: rgb(0.3, 0.3, 0.3)
	});
}

/** Adds a page number/version footer to each page of a single-tune PDF. */
async function stampFooters(pdfBytes) {
	const doc = await PDFDocument.load(pdfBytes);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	doc.getPages().forEach((page, i) => {
		drawFooter(page, font, i + 1);
	});
	return await doc.save();
}

/** Combines the single-tune PDFs into a booklet with a cover page, table of contents, page numbers and bookmarks. */
async function generateBooklet(appName, tunes, rawPdfs) {
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
		return { ...tune, startPage };
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
	const coverTitle = encodableText(fontBold, titleOverride ?? appName);
	cover.drawText(coverTitle, {
		x: (PAGE_WIDTH - fontBold.widthOfTextAtSize(coverTitle, 32)) / 2,
		y: PAGE_HEIGHT / 2 + 60,
		size: 32,
		font: fontBold
	});
	const coverSubtitle = encodableText(font, subtitle);
	cover.drawText(coverSubtitle, {
		x: (PAGE_WIDTH - font.widthOfTextAtSize(coverSubtitle, 20)) / 2,
		y: PAGE_HEIGHT / 2 + 20,
		size: 20,
		font
	});
	const generatedLine = encodableText(font, source != null
		? `Generated from ${source}`
		: "Generated from the pattern definitions");
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
			page.drawText("Contents", { x: PAGE_MARGIN, y: y - 16, size: 16, font: fontBold });
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

	// Page number/version footers (all pages except the cover)
	const pages = booklet.getPages();
	for (let i = 1; i < pages.length; i++) {
		drawFooter(pages[i], font, i + 1);
	}

	addOutline(booklet, entries.map((entry) => ({ title: entry.displayName, pageIndex: entry.startPage - 1 })));

	await writeFile(path.join(outDir, "booklet.pdf"), await booklet.save());
}

async function main() {
	await mkdir(outDir, { recursive: true });

	const { server, url } = await serveDist();
	const browser = await puppeteer.launch({
		// --no-sandbox is required when running as root (e.g. in a Docker build)
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"]
	});

	try {
		const page = await browser.newPage();
		page.setDefaultTimeout(120000);

		await page.goto(`${url}#/sheet/`, { waitUntil: "load" });
		await page.waitForSelector(".bb-sheet");
		const appName = await page.title();
		const tunes = await page.evaluate(() => window.bbSheetIndex);
		if (!tunes?.length) {
			throw new Error("No tunes found (window.bbSheetIndex is empty).");
		}

		const rawPdfs = new Map();
		for (const tune of tunes) {
			console.log(`Generating sheet for ${tune.name} (${tune.slug}.pdf)...`);
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
		console.log("Generating booklet.pdf...");
		await generateBooklet(appName, tunes, rawPdfs);
		for (const tune of tunes) {
			await writeFile(path.join(outDir, `${tune.slug}.pdf`), await stampFooters(rawPdfs.get(tune.slug)));
		}

		console.log(`Generated ${tunes.length} tune sheets and the booklet in ${outDir}.`);
	} finally {
		await browser.close();
		server.close();
	}
}

await main();
