import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'

export default defineConfig({
	plugins: [ devtools(), solidPlugin() ],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 3000,
		allowedHosts: [ 'pandacss.test' ],
	},
	build: {
		target: 'esnext',
		sourcemap: true,
	},
})
