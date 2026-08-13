<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import '$lib/styles/theme.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/verski-icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/verski-180.png" />
	<meta name="apple-mobile-web-app-title" content="Verski" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#e96224" />
</svelte:head>

{@render children()}
