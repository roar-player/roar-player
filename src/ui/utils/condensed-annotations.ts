import config, { Instrument } from "../../config";
import { CondensedSegment } from "../../state/condensed";
import { getI18n } from "../../services/i18n";

/**
 * Label helpers for the repeat/volume annotations of the condensed pattern representation (see
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
 * to all sounding instruments (passed as allInstruments), they are named, e.g. “(Snare: soft to loud)” — or,
 * when that is the majority of the instruments, the others are, e.g. “(All but Repi: soft)”.
 */
export function getAnnotationText(segment: CondensedSegment, allInstruments: Instrument[]): string | undefined {
	const i18n = getI18n();
	const annotation = segment.dynamics ?? segment.volume;
	if (!annotation) {
		return undefined;
	}
	let text = i18n.t(`condensed.${annotation}`);
	if (segment.annotationInstruments) {
		const affected = segment.annotationInstruments;
		const others = allInstruments.filter((instrument) => !affected.includes(instrument));
		const names = affected.length > others.length
			? i18n.t("condensed.all-but", { instruments: getInstrumentsLabel(others) })
			: getInstrumentsLabel(affected);
		text = `${names}: ${text}`;
	}
	return `(${text})`;
}
