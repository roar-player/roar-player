import config from "../config";
import { getI18n } from "./i18n";

type ScrollState = {
	parent: HTMLElement;
	/** The offset between the tracked element's offsetLeft and its position within the scroll parent. */
	left: number;
	/** Set when the user scrolled manually; suppresses all automatic scrolling until the element is visible again. */
	scrollingDisabled: boolean;
	/** The scrollLeft that our own scroll animation is currently animating towards, if any. */
	scrollTarget?: number;
	/** When a scrollTarget was last set, used to attribute scroll events to our own animations (which can trail
	 * behind, e.g. when a scroll-back supersedes a running page turn) and to expire animations that were
	 * interrupted without us noticing. */
	scrollTargetTime?: number;
};

declare global {
	interface HTMLElement {
		_bbScroll?: ScrollState;
	}
}

/**
 * Finds (and caches) the nearest scrollable ancestor of the element and sets up the manual-scroll detection:
 * when the user scrolls the container themselves, all automatic scrolling is suspended until the tracked
 * element is fully visible again. User intent is detected from input events (which fire regardless of any
 * animation of ours), because scroll events alone cannot distinguish a scroll gesture from a running animation
 * in the same direction. The scroll listener only detects the arrival of our animations, plus manual scrolling
 * that produces no input events on the container (e.g. dragging a scrollbar).
 */
function getScrollState(element: HTMLElement): ScrollState | undefined {
	if(!element._bbScroll) {
		let left = 0;
		let curEl: HTMLElement | null = element.offsetParent as HTMLElement;
		const ov = (el: HTMLElement) => {
			const style = getComputedStyle(el);
			return style.overflowX || style.overflow;
		}
		while(curEl && [ "auto", "scroll" ].indexOf(ov(curEl) as any) == -1) {
			left += curEl.offsetLeft;
			curEl = curEl.offsetParent as HTMLElement;
		}

		if(!curEl)
			return undefined;

		element._bbScroll = {
			parent: curEl,
			left,
			scrollingDisabled: false
		};

		const suspend = () => {
			const scroll = element._bbScroll!;
			scroll.scrollTarget = undefined;
			scroll.scrollingDisabled = true;
		};
		element._bbScroll.parent.addEventListener("scroll", () => {
			const scroll = element._bbScroll!;
			if(scroll.scrollTarget != null && Math.abs(scroll.parent.scrollLeft - scroll.scrollTarget) <= 1) {
				// Our own animation has arrived at its target
				scroll.scrollTarget = undefined;
			} else if(scroll.scrollTarget == null && Date.now() - (scroll.scrollTargetTime ?? 0) > 600) {
				// No animation of ours is running or has recently finished (whose trailing events could still
				// arrive), so this must be a manual scroll that the input listeners cannot see
				suspend();
			}
		});
		// Only horizontal wheel gestures: a vertical wheel over the container scrolls the page, not the container
		element._bbScroll.parent.addEventListener("wheel", (event) => {
			if(event.deltaX != 0 || event.shiftKey)
				suspend();
		}, { passive: true });
		element._bbScroll.parent.addEventListener("touchmove", suspend, { passive: true });
		// A pointerdown on the container element itself (not on any content) means grabbing the scrollbar
		element._bbScroll.parent.addEventListener("pointerdown", (event) => {
			if(event.target == element._bbScroll!.parent)
				suspend();
		});
	}

	if(element._bbScroll.scrollTarget != null && Date.now() - (element._bbScroll.scrollTargetTime ?? 0) > 1000) {
		// Our animation should long have arrived at its target, so it was probably interrupted without us
		// noticing (e.g. by a touch gesture in the same direction, which the scroll listener cannot tell apart
		// from the animation itself). Judging the position against the stale target would block any follow-up.
		element._bbScroll.scrollTarget = undefined;
	}

	return element._bbScroll;
}

/** Starts a scroll animation towards the given scrollLeft (no-op if one towards the same target is running). */
function scrollTo(scroll: ScrollState, target: number, behavior: "smooth" | "glide"): void {
	const clamped = Math.max(0, Math.min(Math.round(target), scroll.parent.scrollWidth - scroll.parent.clientWidth));
	if(Math.abs(clamped - scroll.parent.scrollLeft) <= 1) {
		// Already there (the actual maximum scroll position can also be a fraction below the computed one, so
		// a 1px difference must not restart the animation) — and no scroll event will clear the target
		scroll.scrollTarget = undefined;
	} else if(clamped != scroll.scrollTarget) {
		scroll.scrollTarget = clamped;
		scroll.scrollTargetTime = Date.now();
		if(behavior == "glide") {
			// A quick ease-out glide, rather than the browser's smooth scrolling (which takes its time and
			// would leave the element out of sight for most of the animation): the view leaves quickly and
			// decelerates into the target, so the eye can follow where it lands.
			// An instant no-op scroll first, so that a still-running browser animation (e.g. a page turn
			// that this glide interrupts) is cancelled before the glide's first frame rather than by it.
			scroll.parent.scroll({ left: scroll.parent.scrollLeft, behavior: 'auto' });
			const from = scroll.parent.scrollLeft;
			const duration = Math.min(400, 150 + Math.abs(clamped - from) / 4);
			const start = performance.now();
			const step = (now: number) => {
				if(scroll.scrollTarget != clamped)
					return; // Superseded by another scroll or aborted by a user scroll
				const t = Math.min(1, (now - start) / duration);
				scroll.parent.scrollLeft = from + (clamped - from) * (1 - (1 - t) ** 3);
				if(t < 1)
					requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		} else {
			scroll.parent.scroll({ left: clamped, behavior: 'smooth' });
		}
	}
}

/** Handles the manual-scroll suspension: returns true while automatic scrolling is suspended, re-enabling it
 * once the tracked position is fully visible again (judged against the real scroll position). */
function checkSuspended(scroll: ScrollState, left: number, width: number): boolean {
	if(scroll.scrollingDisabled && left >= scroll.parent.scrollLeft && left + width <= scroll.parent.scrollLeft + scroll.parent.clientWidth) {
		scroll.scrollingDisabled = false;
	}
	return scroll.scrollingDisabled;
}

/**
 * Scrolls the nearest scrollable ancestor so that the element is visible, unless the user has scrolled manually
 * (until the element is fully visible again). leftInParent overrides the element's horizontal position, for
 * elements that are positioned through a transform (which offsetLeft ignores).
 */
export function scrollToElement(element: HTMLElement, force: boolean = false, leftInParent?: number): void {
	const scroll = getScrollState(element);
	if(!scroll)
		return;

	if(force)
		scroll.scrollingDisabled = false;

	const left = (leftInParent ?? element.offsetLeft) + scroll.left;
	if(checkSuspended(scroll, left, element.offsetWidth))
		return;

	// Judge against the target of a running animation of ours, so that it is not needlessly restarted
	const scrollLeft = scroll.scrollTarget ?? scroll.parent.scrollLeft;
	if(left + element.offsetWidth > scrollLeft + scroll.parent.clientWidth)
		scrollTo(scroll, left + element.offsetWidth - scroll.parent.clientWidth, "smooth");
	else if(left < scrollLeft)
		scrollTo(scroll, left, "smooth");
}

/** The playback context that followPlayback() uses to plan its scrolling, in pixel positions within the scroll parent. */
export type FollowPlaybackContext = {
	/** How much of the content after the current position should ideally be kept visible ("read-ahead", e.g.
	 * the width of the next 3 beats). Defaults to 35% of the viewport. */
	aheadWidth?: number;
	/** The repeated block that the position is currently playing in, if any. */
	block?: {
		start: number;
		end: number;
		/** Whether this is the last iteration, i.e. playback will move on instead of jumping back to start. */
		final: boolean;
	};
};

/**
 * Scrolls the nearest scrollable ancestor of the position marker to follow it during playback, so that the
 * notes are pleasant to read along. In descending priority: the current position is kept visible; the upcoming
 * content (aheadWidth) is kept visible; as few scrolls as possible are made (when a scroll is needed, it is a
 * big step, so that the view then stays calm for a while); and while a repeated block that fits the viewport is
 * playing, the whole block is kept in view so that its repetitions need no scrolling at all.
 * Suspended while the user scrolls manually (until the marker is fully visible again); force (used when
 * playback starts) lifts the suspension.
 */
export function followPlayback(element: HTMLElement, left: number, context: FollowPlaybackContext = {}, force: boolean = false): void {
	const scroll = getScrollState(element);
	if(!scroll)
		return;

	if(force)
		scroll.scrollingDisabled = false;

	const pos = left + scroll.left;
	if(checkSuspended(scroll, pos, element.offsetWidth))
		return;

	const width = scroll.parent.clientWidth;
	// Trigger margin (tolerance before a rule counts as violated) and placement margin (breathing space that a
	// scroll leaves to the viewport edges); the difference provides hysteresis against pixel-rounding loops.
	const margin = 12;
	const trigger = 4;
	// Where a scroll lands the current position, as a fraction of the viewport from the left edge
	const landing = 0.12;
	// Judge against the target of a running animation of ours, so that it is not needlessly restarted
	const scrollLeft = scroll.scrollTarget ?? scroll.parent.scrollLeft;
	const block = context.block;

	// While a repeated block that fits the viewport is playing (and will jump back to its start again), keep
	// the whole block in view — then the repetitions need no scrolling at all.
	if(block && !block.final && block.end - block.start <= width - 2 * margin) {
		if(block.start < scrollLeft + trigger || block.end > scrollLeft + width - trigger) {
			// Scroll the minimal distance that fits the whole block (with the placement margin)
			const target = block.start < scrollLeft + trigger
				? block.start - margin
				: block.end + margin - width;
			scrollTo(scroll, target, target < scrollLeft ? "glide" : "smooth");
		}
		return;
	}

	// How far behind the position the view should reach: the desired read-ahead. On narrow viewports where the
	// full read-ahead would make every page turn a tiny step (continuous creeping), it is trimmed so that each
	// turn buys a calm period of at least 2 beats or 40% of the viewport — briefly showing less ahead right
	// before a turn reads better than a constantly moving view.
	const ahead = context.aheadWidth ?? width * 0.35;
	const step = Math.max(ahead * 2 / 3, width * 0.4);
	let reqEnd = pos + Math.min(ahead, Math.max(width - trigger - width * landing - step, width * 0.25));
	// ... but not beyond the end of a block that is about to jump back to its start (what comes next is the
	// block start, not what is printed after the block — so no page turn right before the jump)
	if(block && !block.final)
		reqEnd = Math.min(reqEnd, block.end);

	if(pos < scrollLeft) {
		// The position jumped backwards (e.g. a repeated block starting over): glide back, landing the position
		// at the usual reading position — or at the very start when the jump goes near it, so that the
		// beginning of the content (e.g. the instrument names) is shown. The latter only if the view can then
		// stay calm for a while (the read-ahead plus half a page-turn step), so that the glide to the start is
		// not immediately interrupted by a page turn.
		const target = pos - width * landing;
		scrollTo(scroll, target < width / 2 && reqEnd + step / 2 <= width - trigger ? 0 : target, "glide");
	} else if(reqEnd > scrollLeft + width - trigger) {
		// Less than the desired read-ahead (or not even the position itself) is visible: turn the page, landing
		// the position near the left edge — one big step, so that the view then stays calm for a while. If the
		// required read-ahead is even wider than that, keeping the position visible wins.
		scrollTo(scroll, Math.min(Math.max(pos - width * landing, reqEnd + margin - width), pos - margin), "smooth");
	}
}

export function makeAbsoluteUrl(url: string): string {
	return new URL(url, location.href).href;
}

export function readableDate(tstamp: number, tstampBefore: number = 0, tstampAfter: number = 0): string {
	const date = new Date(tstamp*1000);
	const dateBefore = new Date(tstampBefore*1000);
	const dateAfter = new Date(tstampAfter*1000);
	const now = new Date();

	const time = (secs: boolean) => pad(date.getHours()) + ":" + pad(date.getMinutes()) + (secs ? ":" + pad(date.getSeconds()) : "");
	const daysAgo = (d: Date) => Math.round((now.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime()) / 86400000);
	const weeksAgo = (d: Date) => Math.round(daysAgo(d)/7);
	const monthsAgo = (d: Date) => Math.round(daysAgo(d)/30.436875);
	const yearsAgo = (d: Date) => Math.round(daysAgo(d)/365.2425);
	const sameMinute = (d1: Date, d2: Date) => sameDay(d1, d2) && d1.getHours() == d2.getHours() && d1.getMinutes() == d2.getMinutes();
	const sameDay = (d1: Date, d2: Date) => d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
	const pad = (n: number) => (n<10 ? '0'+n : n);
	const i18n = getI18n();

	if(sameDay(date, now))
		return i18n.t("utils.time-day-and-time", { day: i18n.t("utils.time-today"), time: time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter)) });

	const days = daysAgo(date);
	if(days <= 12) {
		const day = (days == 1 ? i18n.t("utils.time-yesterday") : i18n.t("utils.time-days-ago", { count: days }));
		return sameDay(date, dateBefore) || sameDay(date, dateAfter) ? (
			i18n.t("utils.time-day-and-time", { day, time: time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter)) })
		) : day;
	}

	const weeks = weeksAgo(date);
	if(weeks <= 6 && weeks != weeksAgo(dateBefore) && weeks != weeksAgo(dateAfter))
		return i18n.t("utils.time-weeks-ago", { count: weeks });

	const months = monthsAgo(date);
	if(weeks > 6 && months <= 10 && months != monthsAgo(dateBefore) && weeks != monthsAgo(dateAfter))
		return i18n.t("utils.time-months-ago", { count: months });

	const years = yearsAgo(date);
	if(months > 10 && years != yearsAgo(dateBefore) && years != yearsAgo(dateAfter))
		return i18n.t("utils.time-years-ago", { count: years });

	const month = [
		() => i18n.t("utils.time-month-jan"),
		() => i18n.t("utils.time-month-feb"),
		() => i18n.t("utils.time-month-mar"),
		() => i18n.t("utils.time-month-apr"),
		() => i18n.t("utils.time-month-may"),
		() => i18n.t("utils.time-month-jun"),
		() => i18n.t("utils.time-month-jul"),
		() => i18n.t("utils.time-month-aug"),
		() => i18n.t("utils.time-month-sep"),
		() => i18n.t("utils.time-month-oct"),
		() => i18n.t("utils.time-month-nov"),
		() => i18n.t("utils.time-month-dec"),
	][date.getMonth()]();
	const day = pad(date.getDate());
	const fullDay = date.getFullYear() != now.getFullYear() ? i18n.t("utils.time-day-with-year", { day, month, year: date.getFullYear() }) : i18n.t("utils.time-day-without-year", { day, month });
	if(sameDay(date, dateBefore) || sameDay(date, dateAfter))
		return i18n.t("utils.time-day-and-time", { day: fullDay, time: time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter)) });
	else
		return fullDay;
}

export function isoDate(tstamp: number): string {
	const d = new Date(tstamp*1000);
	const pad = (n: number) => (n<10 ? '0'+n : n);
	return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getTuneOfTheYear(): string {
	const tunes = Array.isArray(config.tuneOfTheYear) ? config.tuneOfTheYear : [config.tuneOfTheYear];
	return tunes[Math.floor(Math.random() * tunes.length)];
}