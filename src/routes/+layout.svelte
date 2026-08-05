<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import '$lib/styles/theme.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
