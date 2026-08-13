import config, { Instrument } from "../../config";
import { CondensedSegment, CondensedTempoMark } from "../../state/condensed";
import { getI18n } from "../../services/i18n";

/**
 * Label helpers for the repeat/volume/tempo annotations of the condensed pattern representation (see
 * src/state/condensed.ts), shared between the printable tune sheets and the pattern player.
 */

/**
 * Names a group of instruments: complete alias groups (e.g. “Dobra 1, Dobra 2” → “Dobras”) are replaced
 * with their alias name; if the result then still lists several names, the instruments use their short
 * names (e.g. “Tambi” for “Tamborim”).
 */
export function getInstrumentsLabel(instruments: Instrument[]): string {
	const remaining = new Set(instruments);
	const parts: Array<{ order: number; name: (short: boolean) => string }> = [];
	for (const alias of [...(config.instrumentAliases ?? [])].sort((a, b) => b.instruments.length - a.instruments.length)) {
		if (alias.instruments.length > 0 && alias.instruments.every((instrument) => remaining.has(instrument))) {
			for (const instrument of alias.instruments) {
				remaining.delete(instrument);
			}
			parts.push({
				order: Math.min(...alias.instruments.map((instrument) => config.instrumentKeys.indexOf(instrument))),
				name: () => alias.name()
			});
		}
	}
	for (const instrument of remaining) {
		parts.push({
			order: config.instrumentKeys.indexOf(instrument),
			name: (short) => (short && config.instruments[instrument].shortName || config.instruments[instrument].name)()
		});
	}
	return parts.sort((a, b) => a.order - b.order).map((part) => part.name(parts.length > 1)).join(", ");
}

/**
 * The parenthesized volume annotation of a segment, e.g. “(soft to loud)”. If the annotation does not apply
 * to all instruments sounding within the annotated bars, they are named, e.g. “(Snare: soft to loud)” — or,
 * when that is the majority of those instruments, the others are, e.g. “(All but Repi: soft)”.
 */
export function getAnnotationText(segment: CondensedSegment): string | undefined {
	const i18n = getI18n();
	const annotation = segment.dynamics ?? segment.volume;
	if (!annotation) {
		return undefined;
	}
	let text = i18n.t(`condensed.${annotation}`);
	if (segment.annotationInstruments) {
		const affected = segment.annotationInstruments;
		const others = (segment.annotationAllInstruments ?? []).filter((instrument) => !affected.includes(instrument));
		const names = affected.length > others.length
			? i18n.t("condensed.all-but", { instruments: getInstrumentsLabel(others) })
			: getInstrumentsLabel(affected);
		text = `${names}: ${text}`;
	}
	return `(${text})`;
}

/**
 * The glyph of the tempo marks at a bar line: “♩+” for a speed-up, “♩−” for a slow-down. Several marks at the
 * same bar (e.g. a step into a block plus an accelerando over its repetitions) share one glyph.
 */
export function getTempoMarkGlyph(marks: CondensedTempoMark[]): string {
	return marks[marks.length - 1].step < 0 ? "♩−" : "♩+";
}

/** Formats a bpm delta with an explicit sign, e.g. “+10” or “−10”. */
function formatBpmDelta(bpm: number): string {
	return `${bpm < 0 ? "−" : "+"}${Math.abs(bpm)}`;
}

/**
 * The tooltip of the tempo marks at a bar line, naming the exact bpm deltas (which are not printed on the
 * sheets — the actual speed is not fixed, everything scales with the playback speed).
 */
export function getTempoMarkTooltip(marks: CondensedTempoMark[]): string {
	const i18n = getI18n();
	return marks.map((mark) => i18n.t(
		mark.iterations != null ? "condensed.tempo-each" : "condensed.tempo-step",
		{ bpm: formatBpmDelta(mark.step) }
	)).join("\n");
}
