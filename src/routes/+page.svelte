<script lang="ts">
	import { lookupPassage, type LookupPassageResult } from '$lib/application/lookup-passage';
	import {
		parseReference,
		type ParseReferenceError,
		type ParseReferenceResult
	} from '$lib/domain/parser/parse-reference';
	import { StaticBibleRepository } from '$lib/storage/static-bible-repository';
	import type { PageData } from './$types';
	import { formatPassageForCopy } from '$lib/application/format-passage-for-copy';
	import { johnBook } from '$lib/domain/bible-book';

	let { data }: { data: PageData } = $props();

	const repository = $derived(new StaticBibleRepository(data.translationPackage));

	const errorMessages: Record<ParseReferenceError, string> = {
		'invalid-format': 'Enter a reference such as John 3:16.',
		'invalid-structure': 'Chapter and verse numbers must be positive whole numbers.',
		'unknown-book': 'That Bible book is not available.',
		'invalid-chapter': 'That chapter does not exist in this Bible book.',
		'invalid-verse-range': 'The ending verse cannot come before the starting verse.'
	};

	let referenceInput = $state('');
	let parseResult = $state<ParseReferenceResult | null>(null);
	let lookupResult = $state<LookupPassageResult | null>(null);
	let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const nextParseResult = parseReference(referenceInput);

		parseResult = nextParseResult;
		lookupResult = null;

		if (!nextParseResult.ok) {
			return;
		}

		lookupResult = await lookupPassage(
			repository,
			data.translationPackage.manifest.id,
			nextParseResult.reference
		);
	}

	async function handleCopy() {
		const currentLookupResult = lookupResult;

		if (!currentLookupResult?.ok) {
			return;
		}

		const passage = currentLookupResult.passage;

		const bookName =
			passage.bookId === johnBook.id ? (johnBook.names[0] ?? johnBook.id) : passage.bookId;

		const text = formatPassageForCopy(passage, {
			bookName,
			translationName: data.translationPackage.manifest.name
		});

		try {
			await navigator.clipboard.writeText(text);
			copyStatus = 'copied';
		} catch {
			copyStatus = 'error';
		}
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
		{:else if !parseResult.ok}
			<p>{errorMessages[parseResult.error]}</p>
		{:else if lookupResult === null}
			<p>Loading passage…</p>
		{:else if !lookupResult.ok}
			{#if lookupResult.error === 'chapter-not-found'}
				<p>This chapter is not available in the selected translation.</p>
			{:else}
				<p>That verse does not exist in this chapter.</p>
			{/if}
		{:else}
			<p>
				{#each lookupResult.passage.verses as verse}
					<span>
						<sup>{verse.number}</sup>
						<span>{verse.text}</span>{' '}
					</span>
				{/each}
			</p>
			<button type="button" onclick={handleCopy}> Copy passage </button>

			{#if copyStatus === 'copied'}
				<p>Passage copied.</p>
			{:else if copyStatus === 'error'}
				<p>Passage could not be copied.</p>
			{/if}
		{/if}
	</section>
</main>
