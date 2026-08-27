<script lang="ts">
	import '@fontsource/work-sans/latin-400.css';
	import '@fontsource/work-sans/latin-ext-400.css';
	import '@fontsource/work-sans/latin-500.css';
	import '@fontsource/work-sans/latin-ext-500.css';

	import '@fontsource/instrument-serif/latin-400.css';
	import '@fontsource/instrument-serif/latin-ext-400.css';
	import '@fontsource/instrument-serif/latin-400-italic.css';
	import '@fontsource/instrument-serif/latin-ext-400-italic.css';

	import '@fontsource/lora/latin-400.css';
	import '@fontsource/lora/latin-ext-400.css';

	import '@picocss/pico/css/pico.min.css';
	import '$lib/styles/theme.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/verski-icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/verski-apple-touch-180.png" />
	<meta name="apple-mobile-web-app-title" content="Verski" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#e96224" />
</svelte:head>

{@render children()}
