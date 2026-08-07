<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import '$lib/styles/theme.css';

	import ThemeSelector from '$lib/components/ThemeSelector.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link
		rel="icon"
		href="/verski-icon.svg"
		type="image/svg+xml"
	/>
	<link
		rel="manifest"
		href="/manifest.webmanifest"
	/>
	<meta name="theme-color" content="#e96224" />
</svelte:head>

<ThemeSelector />

{@render children()}
