import devtools from 'solid-devtools/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig(({ command }) => ({
	plugins: [ command === 'serve' && devtools({
		autoname: true,
	}), solidPlugin() ],
	resolve: {
		tsconfigPaths: true,
		conditions: [ 'solid', 'browser', 'module', 'development' ],
	},
	server: {
		port: 3000,
		allowedHosts: [ 'pandacss.test', 'solidjs20.test' ],
	},
	build: {
		target: 'esnext',
		sourcemap: true,
	},
	optimizeDeps: {
		exclude: [ 'solid-js', '@solidjs/web', 'solid-js/store' ],
	},
}))
