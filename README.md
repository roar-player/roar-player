[RoR Player](https://player.rhythms-of-resistance.org/) is a browser-based player for
[Rhythms of Resistance tunes](https://github.com/rhythms-of-resistance/sheetbook/tree/master/generated).
It is written in TypeScript and relies heavily on beatbox.js, Vue.js and Bootstrap. The core features are:

* Read and play the notes of all RoR tunes and breaks
* Edit the notes, even while they are playing
* Compose own tunes and breaks and share them as a link. The notes are stored in the hash part of the link, nothing is stored on the server.
* Compose songs (sequences of tunes and breaks in different combinations)
* Export tunes, breaks and songs as MP3 or WAV
* Smartphone-friendly UI
* Can be used offline. Everything is packed in a single HTML file that is cached in the browser and can easily be downloaded for offline use.
* License: AGPL-3

More information can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/).

Used technologies are:
* [TypeScript](https://www.typescriptlang.org/) and [SASS](https://sass-lang.com/) for cleaner code
* [Vue.js](https://vuejs.org/), [Bootstrap 5](https://getbootstrap.com/) and [Font Awesome](https://fontawesome.com/) for the UI
* The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for playing and exporting songs
* [wav-encoder](https://github.com/mohayonao/wav-encoder) and [wasm-media-encoders](https://github.com/arseneyr/wasm-media-encoders)
  for encoding exported songs to WAV/MP3
* [pako](https://github.com/nodeca/pako) to compress shared links
* [Vite](https://vitejs.dev/) for building and [Vitest](https://vitest.dev/) for testing
* [i18next](https://www.i18next.com/) for internationalization and [Weblate](https://weblate.org/) to manage translations.


Contribute new tunes
====================

Please see the [contribution guide](https://player-docs.rhythms-of-resistance.org/guide/contribution/tunes.html) for instructions how to add new tunes to the player.


Contribute translations
=======================

Translations are managed on [Weblate](https://hosted.weblate.org/projects/ror-player/#information). Register there to start contributing.


Technical notes
===============

* The current state (modifications to tunes/breaks and own compositions) is stored in the local storage of the browser. The `bbState` item
  contains the current state, historical states are stored as `bbState-<timestamp>`.
* A service worker stores a copy of the `index.html` file in the application cache. When opening the player, it is loaded from the cache if
  it is available there (to speed up loading and to make offline access possible). Only after the player is loaded, the service worker
  downloads the most recent `index.html` from the server (if the connection is possible) and updates the cache. Once downloaded, if the file
  has changed, a notification is shown in the player, and the page has to be reloaded in order to show the updated version.


Build and host it yourself
==========================

Customise it
------------

The tunes are configured in [`src/defaultTunes.ts`](./src/defaultTunes.ts). The format is very similar to the "Raw (uncompressed)" format that
can be generated in the Share dialog of the player.

All the parameters (such as the instruments, samples, time measurements) are configured in [`src/config.ts`](./src/config.ts).

The samples are available as MP3 files in [`assets/audio`](./assets/audio). Their file names have the format `${instrumentKey}_${strokeHex}.mp3`, where `strokeHex` is the stroke key char code in hex.

The tune descriptions can be found in [`assets/tuneDescriptions`](./assets/tuneDescriptions).

More details can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/guide/technical/config.html).

Build it
--------

Once you have made your modifications, you can build the player to get a HTML file that you can use in your browser:
1. Make sure you have an up-to-date version of Node.js installed.
2. In a terminal, navigate to the main code directory of the player and run `npm install` to install the dependencies.
3. Run `npm run build` to build the project.
4. The file `build/index.html` is a self-sufficient build of the player that can be opened in the browser

While you are playing around with some changes and don't want to rebuild the whole project each time you made a small change,
after step 2 you can run `npm run dev-server` instead. This will start a webserver on http://localhost:8080/ that will serve
the built player. When you make any changes to a file, it detects that and rebuild just that file. Simply reload the page to
see the updated player.

Generate PDF tune sheets
------------------------

Printable A4 tune sheets can be generated automatically from the pattern definitions. The player renders them on the
`#/sheet/<tune name>` route (and `#/sheet/` for a booklet preview of all tunes), condensed compared to the regular
pattern view: instruments that play the same line are merged into one row (e.g. “Repi” and “Everybody else”),
instruments that don't play anything are omitted, repeated bars are shown once with a repeat count (“×4”, with
crescendos/decrescendos indicated textually), and a legend explains the stroke symbols.

To turn them into PDFs, run `npm run build-sheets` after `npm run build`. This renders the sheet routes of the built
player in headless Chromium (via Puppeteer) and writes one PDF per tune plus a `booklet.pdf` (with cover, table of
contents, page numbers and bookmarks) to `dist/pdf/`.

In environments where Puppeteer cannot download its own browser (e.g. a Docker build), install a system Chromium and
set `PUPPETEER_SKIP_DOWNLOAD=1` during `npm install` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` when running
`npm run build-sheets`. For nice cover/contents pages, a Unicode TTF font should be available (e.g. the
`fonts-dejavu`/`ttf-dejavu` package); rendering the sheets themselves uses the browser's fonts.

If the tune descriptions reference images that are not part of the build output (e.g. sign images served from a
separate folder), pass the folders in `SHEETS_STATIC_DIRS` (colon-separated); each folder is served under its
basename while rendering, e.g. `SHEETS_STATIC_DIRS=/player/signs npm run build-sheets` serves `/player/signs/x.gif`
as `signs/x.gif`. Animated GIFs appear as their first frame in the PDFs.

The booklet cover and the page footers can be customized through environment variables: `SHEETS_TITLE` (the
title on the cover page, default: the app name, i.e. the HTML `<title>` of the build), `SHEETS_SUBTITLE` (the
subtitle on the cover page, default "Tune sheets"), `SHEETS_SOURCE` (where the sheets were generated from, e.g. a
player URL, shown on the cover page), `SHEETS_LOGO` (path to a PNG/JPEG logo shown on the cover page) and
`SHEETS_VERSION` (shown on the cover page and in the footer of every page, defaults to today's date).

Since the description Markdown may contain raw HTML, content that should only be shown in the app but not on the
generated sheets can be wrapped in an element with the class `no-sheet`, e.g.
`<div class="no-sheet">...</div>` (with blank lines around the tags, the content in between is still rendered
as Markdown).

Emoji (e.g. in tune names or descriptions) are rendered on the sheets if an emoji font is installed (e.g. the
`font-noto-emoji` package); on the booklet's cover and contents pages (which are not rendered by the browser)
they are replaced with "?".

Host it
-------

Information how to host RoR Player can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/guide/technical/host.html).