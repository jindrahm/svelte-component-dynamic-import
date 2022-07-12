import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev', '--port=12345'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

function getModulePath(id) {
	if (id === 'svelte' || id === 'svelte/internal') {
		return './svelteInternal.js';
	}

	return null;
}

const plugins = [
	svelte({
		dev: !production
	}),
	resolve({
		browser: true,
		dedupe: ['svelte']
	}),
	commonjs(),
	!production && serve(),
	!production && livereload('public')
];

export default [
	{
		input: 'src/main.js',
		external: id => Boolean(getModulePath(id)),
		output: {
			format: 'esm',
			name: 'app',
			file: 'public/build/main.js',
			paths: getModulePath
		},
		plugins,
		watch: {clearScreen: false},
		onwarn (warning, warn) {
			if (warning.code === 'UNRESOLVED_IMPORT' && warning.source === 'http://localhost:12345/build/MainCompo.js') {
				return;
			}
	
			warn(warning);
		}
	}, {
		input: 'src/MainCompo.svelte',
		external: id => Boolean(getModulePath(id)),
		output: {
			format: 'esm',
			name: 'MainCompo',
			file: 'public/build/MainCompo.js',
			paths: getModulePath
		},
		plugins,
		watch: {clearScreen: false}
	}, {
		input: 'node_modules/svelte/internal/index.mjs',
		output: {
			format: 'esm',
			name: 'svelteInternal',
			file: 'public/build/svelteInternal.js'
		},
		plugins,
		watch: {clearScreen: false}
	}
];
