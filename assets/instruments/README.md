# Instruments

Everything instrument-related lives in this folder, so derived players can replace or extend the instruments without touching any code in `src/`:

- **`config.ts`** — the available instruments (in display order) with their per-instrument strokes, the instrument aliases and the volume presets. Strokes are configured *per instrument*: the same stroke character (e.g. `X`) can have a different display representation and description on different instruments.
- **`<instrument key>/<hex>.mp3`** — the sound of one stroke of one instrument, where `<hex>` is the lower-case hex code of the stroke character (e.g. `ls/58.mp3` for stroke `X` of the low surdo). The audio files are picked up automatically by the build (see `rollup-audio-files.ts` and `src/services/player.ts`).

Instrument keys must be exactly 2 characters long (pattern encoder requirement), stroke characters exactly 1 character and not `+` or `@`. The instrument names and stroke descriptions are localized through i18n keys (`config.instruments-<key>`, `config.stroke-description-*`) defined in `assets/i18n/`.
