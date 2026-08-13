import config from "../config";
import { getI18n } from "./i18n";

declare global {
	interface HTMLElement {
		_bbScroll?: {
			parent: HTMLElement;
			left: number;
			scrollingDisabled: boolean;
			/** The scrollLeft that our own smooth scroll is currently animating towards, if any. */
			scrollTarget?: number;
			/** When the current scrollTarget was set, used to expire animations that were silently interrupted. */
			scrollTargetTime?: number;
			lastScrollLeft: number;
		}
	}
}

/**
 * Scrolls the nearest scrollable ancestor so that the element is visible, unless the user has scrolled manually
 * (until the element is fully visible again). With scrollFurther, the view is advanced so that most of the
 * upcoming content is visible (used to follow the position marker during playback). leftInParent overrides the
 * element's horizontal position, for elements that are positioned through a transform (which offsetLeft ignores).
 */
export function scrollToElement(element: HTMLElement, scrollFurther: boolean = false, force: boolean = false, leftInParent?: number): void {
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
			return;

		element._bbScroll = {
			parent: curEl,
			left,
			scrollingDisabled: false,
			lastScrollLeft: curEl.scrollLeft
		};
		element._bbScroll.parent.addEventListener("scroll", () => {
			const scroll = element._bbScroll!;
			const scrollLeft = scroll.parent.scrollLeft;
			if(scroll.scrollTarget != null && Math.abs(scrollLeft - scroll.scrollTarget) <= 1) {
				// Our own smooth scroll has arrived at its target
				scroll.scrollTarget = undefined;
			} else if(scroll.scrollTarget == null || (scrollLeft - scroll.lastScrollLeft) * (scroll.scrollTarget - scroll.lastScrollLeft) < 0) {
				// Not our own smooth scroll on its way towards its target, so the user scrolled manually:
				// suspend the automatic scrolling (it resumes once the element is fully visible again)
				scroll.scrollTarget = undefined;
				scroll.scrollingDisabled = true;
			}
			scroll.lastScrollLeft = scrollLeft;
		});
	}

	if(force)
		element._bbScroll.scrollingDisabled = false;

	if(element._bbScroll.scrollTarget != null && Date.now() - (element._bbScroll.scrollTargetTime ?? 0) > 1000) {
		// Our smooth scroll should long have arrived at its target, so it was probably interrupted without us
		// noticing (e.g. by a touch gesture in the same direction, which the scroll listener cannot tell apart
		// from the animation itself). Judging the position against the stale target would block any follow-up.
		element._bbScroll.scrollTarget = undefined;
	}

	const fac1 = (scrollFurther ? 0.1 : 0);
	const fac2 = (scrollFurther ? 0.9 : 0);

	const scrollTo = (target: number, behavior: "smooth" | "glide") => {
		const scroll = element._bbScroll!;
		const clamped = Math.max(0, Math.min(Math.round(target), scroll.parent.scrollWidth - scroll.parent.clientWidth));
		if(clamped == scroll.parent.scrollLeft) {
			// Already there, no scroll event will fire that could clear the target
			scroll.scrollTarget = undefined;
		} else if(clamped != scroll.scrollTarget) {
			scroll.scrollTarget = clamped;
			scroll.scrollTargetTime = Date.now();
			if(behavior == "glide") {
				// A quick ease-out glide, rather than the browser's smooth scrolling (which takes its time and
				// would leave the element out of sight for most of the animation): the view leaves quickly and
				// decelerates into the target, so the eye can follow where it lands.
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
	};

	// While our own smooth scroll is animating, judge the element position against the target of the animation
	// rather than the transient scroll position, so that the animation is not needlessly restarted or reverted.
	const scrollLeft = element._bbScroll.scrollTarget ?? element._bbScroll.parent.scrollLeft;
	const left = (leftInParent ?? element.offsetLeft) + element._bbScroll.left;
	if(!element._bbScroll.scrollingDisabled) {
		// The position that leaves the most upcoming content visible (for scrollFurther, the element close to
		// the left edge; otherwise aligned with the right edge)
		const target = left + element.offsetWidth - element._bbScroll.parent.offsetWidth * (1-fac2);
		if(left + element.offsetWidth > scrollLeft + element._bbScroll.parent.offsetWidth * (1-fac1))
			scrollTo(target, "smooth");
		else if(left < scrollLeft)
			// When the element jumped backwards during playback (scrollFurther), glide back to the same reading
			// position as when scrolling forward: any other position would immediately trigger a forward scroll
			// again as the element moves on.
			scrollTo(scrollFurther ? target : left, scrollFurther ? "glide" : "smooth");
	} else if(left >= element._bbScroll.parent.scrollLeft && left + element.offsetWidth <= element._bbScroll.parent.scrollLeft + element._bbScroll.parent.offsetWidth)
		element._bbScroll.scrollingDisabled = false;
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