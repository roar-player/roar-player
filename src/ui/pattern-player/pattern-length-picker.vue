<script setup lang="ts">
	import { ThemeColour } from "../../services/bootstrap";
	import { useI18n } from '../../services/i18n';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['length'];

	const props = withDefaults(defineProps<{
		modelValue: Value;
		variant?: ThemeColour;
	}>(), {
		variant: "secondary"
	});

	const emit = defineEmits<{
		"update:modelValue": [value: Value];
	}>();

	const i18n = useI18n();

	const handleUpdate = (value: Value) => {
		emit("update:modelValue", value);
	};

	const lengths = Array.from({ length: 64 }, (_, i) => i + 1);
</script>

<template>
	<div class="dropdown">
		<button class="btn dropdown-toggle" :class="`btn-${props.variant}`" data-bs-toggle="dropdown">{{i18n.t("pattern-length-picker.length", { length: props.modelValue })}}</button>
		<ul class="dropdown-menu">
			<li v-for="le in lengths" :key="le"><a class="dropdown-item" :class="{ active: props.modelValue === le, 'highlight': le % 4 === 0 }" href="javascript:" @click="handleUpdate(le)" draggable="false">{{i18n.t("pattern-length-picker.length", { length: le })}}</a></li>
		</ul>
	</div>
</template>

<style scoped>
.highlight {
    font-weight: bold;
}
</style>
