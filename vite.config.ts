import { defineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import audioFilesPlugin from './rollup-audio-files';
import { viteSingleFile } from "vite-plugin-singlefile";
import { APP_NAME } from './src/appName';

export default defineConfig(({ mode }) => ({
	define: {
		'process.env.DISABLE_SW': String(mode === 'development')
	},
	plugins: [
		vuePlugin(),
		mdPlugin({ mode: [Mode.HTML] }),
		audioFilesPlugin(),
		viteSingleFile(),
		{
			name: 'inject-app-name',
			transformIndexHtml(html) {
				return html.replaceAll('__APP_NAME__', APP_NAME);
			}
		},
	],
	build: {
		sourcemap: true,
		target: ["es2022", "chrome89", "edge89", "safari15", "firefox89", "opera75"],
	},
	test: {
		environment: 'happy-dom'
	}
}));
