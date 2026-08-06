<script lang="ts">
	import {
		parseReference,
		type ParseReferenceError,
		type ParseReferenceResult
	} from '$lib/domain/parser/parse-reference';

	const errorMessages: Record<ParseReferenceError, string> = {
		'invalid-format': 'Enter a reference such as John 3:16.',
		'invalid-structure': 'Chapter and verse numbers must be positive whole numbers.',
		'unknown-book': 'That Bible book is not available.',
		'invalid-chapter': 'That chapter does not exist in this Bible book.',
		'invalid-verse-range': 'The ending verse cannot come before the starting verse.'
	};

	let referenceInput = $state('');
	let parseResult = $state<ParseReferenceResult | null>(null);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		parseResult = parseReference(referenceInput);
	}
</script>

<svelte:head>
	<title>Verski - Bible lookup done right</title>
	<meta name="description" content="Fast, offline-first Bible passage lookup." />
</svelte:head>

<main class="container">
	<header>
		<p>Verski</p>
		<h1>Bible lookup done right</h1>
	</header>

	<form onsubmit={handleSubmit}>
		<label for="reference">Bible reference</label>
		<input
			id="reference"
			name="reference"
			type="search"
			placeholder="John 3:16"
			autocomplete="off"
			bind:value={referenceInput}
		/>
		<button type="submit">Lookup</button>
	</form>

	<section aria-labelledby="passage-heading" aria-live="polite">
		<h2 id="passage-heading">Passage</h2>
		{#if parseResult === null}
			<p>Enter a Bible reference to begin.</p>
		{:else if parseResult.ok}
			<p>Reference recognized. Passage text will appear here once a translation is connected.</p>
		{:else}
			<p>{errorMessages[parseResult.error]}</p>
		{/if}
	</section>
</main>
