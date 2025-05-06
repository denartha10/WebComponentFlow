import { libInjectCss } from "vite-plugin-lib-inject-css";
import { defineConfig } from "vite";
import { resolve } from 'path'

export default defineConfig({
	plugins: [libInjectCss()],
	build: {
		// library options
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			name: 'WebComponentFlow', // global variable name: window.HTMLFlow,
			formats: ['umd'], // UMD bundle
			fileName: (format) => `webcomponent-flow.${format}.js`
		},
		rollupOptions: {
			// externalise dependencies to avoid bundling them
			//external: ['vanjs-core', 'vanjs-ext'],
			output: {
				globals: {
					'vanjs-core': 'van',
					'vanjs-ext': 'vanX'
				}
			}
		}
	}
})
