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
	import { bibleBooks } from '$lib/domain/bible-book';
	import { onMount } from 'svelte';
	import { ensureTranslationInstalled } from '$lib/application/ensure-translation-installed';
	import { IndexedDbBibleRepository } from '$lib/storage/indexed-db/indexed-db-bible-repository';
	import { openBibleDatabase } from '$lib/storage/indexed-db/open-bible-database';
	import { formatBibleReference } from '$lib/application/format-bible-reference';

	let { data }: { data: PageData } = $props();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let indexedDbRepository = $state<IndexedDbBibleRepository | null>(null);
	const repository = $derived(indexedDbRepository ?? staticRepository);
	let offlineStorageStatus = $state<'preparing' | 'ready' | 'unavailable'>('preparing');

	const errorMessages: Record<ParseReferenceError, string> = {
		'invalid-format': 'Enter a reference such as John 3:16.',
		'invalid-structure': 'Chapter and verse numbers must be positive whole numbers.',
		'unknown-book': 'That Bible book is not available.',
		'invalid-verse-range': 'The ending verse cannot come before the starting verse.'
	};

	let referenceInput = $state('');
	let parseResult = $state<ParseReferenceResult | null>(null);
	let lookupResult = $state<LookupPassageResult | null>(null);
	let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');

	const passageHeading = $derived.by(() => {
		const currentParseResult = parseResult;
		const currentLookupResult = lookupResult;

		if (!currentParseResult?.ok || !currentLookupResult?.ok) {
			return 'Passage';
		}

		const bookName = getBookName(currentLookupResult.passage.bookId);
		const reference = formatBibleReference(currentParseResult.reference, bookName);

		return `${reference} (${data.translationPackage.manifest.name})`;
	});

	function getBookName(bookId: string): string {
		return bibleBooks.find((book) => book.id === bookId)?.names[0] ?? bookId;
	}

	onMount(() => {
		let database: IDBDatabase | null = null;
		let disposed = false;

		async function prepareOfflineStorage() {
			const openedDatabase = await openBibleDatabase();

			if (disposed) {
				openedDatabase.close();
				return;
			}

			database = openedDatabase;

			const repository = new IndexedDbBibleRepository(openedDatabase);

			await ensureTranslationInstalled(repository, data.translationPackage);

			if (disposed) {
				return;
			}

			indexedDbRepository = repository;
			offlineStorageStatus = 'ready';
		}

		void prepareOfflineStorage().catch(() => {
			database?.close();
			database = null;

			if (!disposed) {
				offlineStorageStatus = 'unavailable';
			}
		});

		return () => {
			disposed = true;
			database?.close();
		};
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const nextParseResult = parseReference(referenceInput);

		parseResult = nextParseResult;
		lookupResult = null;
		copyStatus = 'idle';

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
		const currentParseResult = parseResult;

		if (!currentLookupResult?.ok || !currentParseResult?.ok) {
			return;
		}

		const passage = currentLookupResult.passage;

		const bookName = getBookName(passage.bookId);

		const text = formatPassageForCopy(passage, {
			reference: currentParseResult.reference,
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

	{#if offlineStorageStatus === 'unavailable'}
		<p role="status">
			Offline storage is unavailable. This translation will remain available for the current
			session.
		</p>
	{/if}

	<section aria-labelledby="passage-heading" aria-live="polite">
		<h2 id="passage-heading">{passageHeading}</h2>

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
				{#each lookupResult.passage.verses as verse (verse.number)}
					<span>
						<sup>{verse.number}</sup>
						<span>{verse.text}</span>&#32;
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
