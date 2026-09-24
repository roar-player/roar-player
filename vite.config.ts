import { defineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import audioFilesPlugin from './rollup-audio-files';
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
	define: {
		'process.env.DISABLE_SW': String(mode === 'development')
	},
	plugins: [
		vuePlugin(),
		// html: true allows raw HTML in the tune descriptions, e.g. to mark content with class="no-sheet"
		// so that it is not printed on the generated tune sheets
		mdPlugin({ mode: [Mode.HTML], markdownIt: { html: true } }),
		audioFilesPlugin(),
		viteSingleFile()
	],
	build: {
		sourcemap: true,
		target: ["es2022", "chrome89", "edge89", "safari15", "firefox89", "opera75"],
	},
	test: {
		environment: 'happy-dom'
	}
}));
