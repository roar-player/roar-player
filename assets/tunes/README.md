# Tunes

Each subdirectory of this folder fully defines one tune. This is deliberate: all tune *data* lives here (never in `src/`), so derived players can replace or add tunes by copying folders without patching any code, and the generated tune sheets can derive a per-tune version date from the git history of each folder.

A tune folder contains:

- **`patterns.ts`** — the tune definition. It exports the tune name and a `RawTune` object (see `../helpers.ts`, which also provides shared helper functions like `repeat()` and `crescendo()`). The folder name is the tune's slug: a URL/filename-safe identifier used e.g. as the file name of the generated sheet PDF — keep it lowercase-with-dashes. All folders matching `*/patterns.ts` are picked up automatically by `src/defaultTunes.ts`.
- **`description.${lang}.md`** — the localized tune descriptions displayed in “Listen” mode, one file per language.
- Any other tune-related assets you want to keep together with the tune.

`helpers.ts` in this folder is shared by all tunes and is part of the tune data as well — a derived player that replaces the whole `tunes` directory must bring its own copy.

## Translations

The description translations are managed on [Weblate](https://hosted.weblate.org/projects/ror-player/) using the [support for Markdown files](https://docs.weblate.org/en/latest/formats/markdown.html). This requires one component per Markdown file and automatically splits up its content into reasonable translation strings. The “Component discovery” add-on automatically creates one component per tune description.

Because of the way Weblate handles Markdown files, changes to the original language (English) must be made here in the repository, while changes to all other languages must be made on Weblate. Do not modify the other languages here in the repository!
