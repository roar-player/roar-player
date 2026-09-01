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
 * The volume annotation of a segment, e.g. “soft to loud”. If the annotation does not apply to all
 * instruments sounding within the annotated bars, they are named, e.g. “Snare: soft to loud” — or, when
 * that is the majority of those instruments, the others are, e.g. “All but Repi: soft”. Next to a repeat
 * count the annotation is parenthesized (`parenthesized`), e.g. “3× (soft to loud)”.
 */
export function getAnnotationText(segment: CondensedSegment, parenthesized: boolean): string | undefined {
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
	return parenthesized ? `(${text})` : text;
}

/**
 * The label of the tempo marks at a bar line: “speed up”/“slow down” for a step change, with the
 * per-repetition info in parentheses — “speed up (at each repetition)” for an accelerando over the
 * repetitions of a block, or “speed up (here and at each repetition)” when a step into the block combines
 * with it. A step and a per-repetition mark in opposite directions (rare) are listed separately.
 */
export function getTempoMarkLabel(marks: CondensedTempoMark[]): string {
	const i18n = getI18n();
	const direction = (mark: CondensedTempoMark) => (mark.step < 0 ? "down" : "up");
	const stepMark = marks.find((mark) => mark.iterations == null);
	const eachMark = marks.find((mark) => mark.iterations != null);
	if (stepMark && eachMark) {
		if (direction(stepMark) === direction(eachMark)) {
			return i18n.t(`condensed.tempo-${direction(stepMark)}-here-and-each`);
		}
		return `${i18n.t(`condensed.tempo-${direction(stepMark)}`)}, ${i18n.t(`condensed.tempo-${direction(eachMark)}-each`)}`;
	}
	const mark = (eachMark ?? stepMark)!;
	return i18n.t(`condensed.tempo-${direction(mark)}${eachMark ? "-each" : ""}`);
}

/** Formats a bpm delta with an explicit sign, e.g. “+10” or “−10”. */
function formatBpmDelta(bpm: number): string {
	return `${bpm < 0 ? "−" : "+"}${Math.abs(bpm)}`;
}

/**
 * The tooltip of the tempo marks at a bar line, naming the exact bpm deltas, e.g. “♩+10bpm” (which are not
 * printed on the sheets — the actual speed is not fixed, everything scales with the playback speed). The
 * context (from here / at each repetition) is carried by the visible label (see getTempoMarkLabel).
 */
export function getTempoMarkTooltip(marks: CondensedTempoMark[]): string {
	const i18n = getI18n();
	return marks.map((mark) => i18n.t("condensed.tempo-bpm", { bpm: formatBpmDelta(mark.step) })).join("\n");
}
