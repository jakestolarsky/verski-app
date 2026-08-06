<script lang="ts">
	let referenceInput = $state('');
	let submittedReference = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submittedReference = referenceInput.trim();
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
		{#if submittedReference}
			<p>
				A passage for <strong>{submittedReference}</strong> will appear here.
			</p>
		{:else}
			<p>Enter a Bible reference to begin.</p>
		{/if}
	</section>
</main>
