<script>
	import { greet } from './greet';

	let { host = 'SvelteKit', guest = 'Vitest' } = $props();
</script>

<main class="container">
	<h1>{greet(host)}</h1>
	<p>{greet(guest)}</p>
	<button type="submit">Subscribe</button>
</main>
