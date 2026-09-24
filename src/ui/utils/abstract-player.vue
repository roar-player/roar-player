<script setup lang="ts">
	import Beatbox from 'beatbox.js';
	import { computed, onBeforeUnmount, ref, watch, watchSyncEffect } from 'vue';
	import config from '../../config';
	import { BeatboxReference, beatToRawPosition, createBeatbox, getPlayerById, rawPositionToBeat, RawPatternWithUpbeat } from '../../services/player';
	import { followPlayback, type FollowPlaybackContext } from '../../services/utils';
	import { PlaybackSettings } from '../../state/playbackSettings';

	export interface PositionData<Optional extends boolean = true> {
		position: Optional extends false ? number : (number | undefined);
		beat: Optional extends false ? number : (number | undefined);
		player: Beatbox;
	}

	const props = defineProps<{
		player?: BeatboxReference;
		rawPattern: RawPatternWithUpbeat;
		playbackSettings: PlaybackSettings;
		getLeft: (data: PositionData<false>) => number;
		/** Provides the playback context (read-ahead width, current repeated block) for the scrolling that
		 * follows the position marker; without it, a generic read-ahead of 35% of the viewport is used. */
		getScrollContext?: (data: PositionData<false>) => FollowPlaybackContext;
	}>();

	const emit = defineEmits<{
		position: [data: PositionData];
	}>();

	const positionMarkerRef = ref<HTMLElement>();

	const playerRef = ref<BeatboxReference>();
	const playerInst = computed(() => playerRef.value && getPlayerById(playerRef.value.id));

	/** The position that the marker was last moved to, to detect backward jumps without a DOM read. */
	let markerLeft = 0;

	const updatePosition = (scroll: boolean, force = false) => {
		const player = getOrCreatePlayer();
		const rawPosition = player.getPosition();
		const position = player.playing || rawPosition > 0 ? Math.min(rawPosition, player._pattern.length) : undefined;
		const beat = position != null ? rawPositionToBeat(position, props.rawPattern) : undefined;
		emit("position", { position, beat, player });
		if (position != null && beat != null) {
			const marker = positionMarkerRef.value!;
			const newLeft = props.getLeft({ position, beat, player });
			if (newLeft < markerLeft) {
				// Jump backwards (e.g. a repeated block starting over) instantly — animating it would show
				// the marker streaking leftwards across the pattern
				marker.style.transition = "none";
				marker.style.transform = `translateX(${newLeft}px)`;
				void marker.offsetWidth; // Flush, so that the transition is not applied to this change
				marker.style.transition = "";
			} else {
				marker.style.transform = `translateX(${newLeft}px)`;
			}
			markerLeft = newLeft;
			if (scroll) {
				followPlayback(marker, newLeft, props.getScrollContext?.({ position, beat, player }), force);
			}
		}
	};

	const handlePlay = () => {
		updatePosition(true, true);
	};

	const handleBeat = () => {
		updatePosition(true);
	};

	const handleStop = () => {
		updatePosition(false);
	};

	const handleSetPosition = () => {
		updatePosition(false);
	};

	watch(() => props.player, () => {
		if (props.player) {
			playerRef.value = props.player;
		}
	}, { immediate: true });

	watchSyncEffect((onCleanup) => {
		if (playerRef.value) {
			const p = playerInst.value!;
			p!.on("play", handlePlay);
			p!.on("beat", handleBeat);
			p!.on("stop", handleStop);
			p!.on("setPosition", handleSetPosition);

			onCleanup(() => {
				p!.off("play", handlePlay);
				p!.off("beat", handleBeat);
				p!.off("stop", handleStop);
				p!.off("setPosition", handleSetPosition);
			});
		}
	});

	const getOrCreatePlayer = (): Beatbox => {
		if (!playerRef.value) {
			playerRef.value = createBeatbox(false);
		}
		return playerInst.value!;
	};

	onBeforeUnmount(() => {
		if (playerInst.value) {
			// Unregister event handlers in case we used an existing player
			playerInst.value.off("play", handlePlay);
			playerInst.value.off("beat", handleBeat);
			playerInst.value.off("stop", handleStop);
			playerInst.value.off("setPosition", handleSetPosition);
		}
	});

	watchSyncEffect(() => {
		if (playerInst.value) {
			playerInst.value.setPattern(props.rawPattern);
			playerInst.value.setUpbeat(props.rawPattern.upbeat);
			playerInst.value.setBeatLength(60000/props.playbackSettings.speed/config.playTime);
			playerInst.value.setRepeat(props.playbackSettings.loop);
		}
	});

	const setPosition = (position: number) => {
		getOrCreatePlayer().setPosition(position);
	};

	const setBeat = (beat: number) => {
		setPosition(Math.floor(beatToRawPosition(beat, props.rawPattern)));
	};

	defineExpose({
		setPosition,
		setBeat,
		playerRef,
		getOrCreatePlayer
	});
</script>

<template>
	<div class="bb-position-marker" :class="{ visible: playerRef?.customPosition }" ref="positionMarkerRef"></div>
</template>

<style lang="scss">
	.bb-position-marker {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		border-left: 1px solid var(--bs-body-color);
		/* The marker moves via transform (rather than left) on its own compositor layer (will-change), so that */
		/* the per-frame updates during playback neither invalidate the layout (the scroll position reads right */
		/* after would force a synchronous reflow of the whole pattern table) nor repaint the table behind it */
		transition: transform 0.1s linear;
		will-change: transform;
		pointer-events: none;
		display: none;
		/* Above the raised .stroke-inner texts of the pattern player */
		z-index: 2;

		&.visible {
			display: block;
		}
	}
</style>