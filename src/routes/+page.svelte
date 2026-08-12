<script lang="ts">
	import PassageResult from '$lib/components/PassageResult.svelte';
	import { lookupPassage, type LookupPassageResult } from '$lib/application/lookup-passage';
	import {
		parseReference,
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
	import { addRecentLookup } from '$lib/application/add-recent-lookup';
	import RecentLookupList from '$lib/components/RecentLookupList.svelte';
	import type { BibleReference } from '$lib/domain/bible-reference';
	import type { RecentLookup } from '$lib/domain/recent-lookup';
	import { clearRecentLookups } from '$lib/application/clear-recent-lookups';
	import { recordRecentLookup } from '$lib/application/record-recent-lookup';
	import { IndexedDbRecentLookupStore } from '$lib/storage/indexed-db/indexed-db-recent-lookup-store';
	import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';

	let { data }: { data: PageData } = $props();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let indexedDbRepository = $state<IndexedDbBibleRepository | null>(null);
	const repository = $derived(indexedDbRepository ?? staticRepository);
	let offlineStorageStatus = $state<'preparing' | 'ready' | 'unavailable'>('preparing');

	let referenceInput = $state('');
	let referenceInputElement = $state<HTMLInputElement>();
	let parseResult = $state<ParseReferenceResult | null>(null);
	let lookupResult = $state<LookupPassageResult | null>(null);
	let recentLookups = $state<RecentLookup[]>([]);
	let recentLookupStore = $state<RecentLookupStore | null>(null);
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

			const historyStore = new IndexedDbRecentLookupStore(openedDatabase);

			try {
				const storedLookups = await historyStore.getRecentLookups();

				if (disposed) {
					return;
				}

				const sessionLookups = recentLookups;
				let mergedLookups = storedLookups;

				for (const sessionLookup of [...sessionLookups].reverse()) {
					mergedLookups = addRecentLookup(mergedLookups, sessionLookup);
				}

				recentLookups = mergedLookups;
				recentLookupStore = historyStore;

				if (sessionLookups.length > 0) {
					await historyStore.replaceRecentLookups(mergedLookups);
				}
			} catch {
				recentLookupStore = null;
			}

			if (disposed) {
				return;
			}

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
			recentLookupStore = null;

			if (!disposed) {
				offlineStorageStatus = 'unavailable';
			}
		});

		return () => {
			disposed = true;
			database?.close();
		};
	});

	async function performLookup(reference: BibleReference) {
		parseResult = {
			ok: true,
			reference
		};
		lookupResult = null;
		copyStatus = 'idle';

		const nextLookupResult = await lookupPassage(
			repository,
			data.translationPackage.manifest.id,
			reference
		);

		lookupResult = nextLookupResult;

		if (!nextLookupResult.ok) {
			return;
		}

		const recentLookup: RecentLookup = {
			translationId: data.translationPackage.manifest.id,
			reference,
			searchedAt: Date.now()
		};

		const historyStore = recentLookupStore;

		if (historyStore === null) {
			recentLookups = addRecentLookup(recentLookups, recentLookup);
			return;
		}

		try {
			recentLookups = await recordRecentLookup(historyStore, recentLookup);
		} catch {
			recentLookupStore = null;
			recentLookups = addRecentLookup(recentLookups, recentLookup);
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const nextParseResult = parseReference(referenceInput);

		if (!nextParseResult.ok) {
			parseResult = nextParseResult;
			lookupResult = null;
			copyStatus = 'idle';
			return;
		}

		await performLookup(nextParseResult.reference);
	}
	function handleReferenceKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		handleClear();
	}

	function handleClear() {
		referenceInput = '';
		parseResult = null;
		lookupResult = null;
		copyStatus = 'idle';

		referenceInputElement?.focus();
	}

	async function handleRecentLookupSelect(lookup: RecentLookup) {
		const bookName = getBookName(lookup.reference.bookId);

		referenceInput = formatBibleReference(lookup.reference, bookName);
		referenceInputElement?.focus();

		await performLookup(lookup.reference);
	}

	async function handleClearRecentLookups() {
		recentLookups = [];
		referenceInputElement?.focus();

		const historyStore = recentLookupStore;

		if (historyStore === null) {
			return;
		}

		try {
			await clearRecentLookups(historyStore);
		} catch {
			recentLookupStore = null;
		}
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
		<div class="reference-search">
			<input
				id="reference"
				name="reference"
				type="search"
				placeholder="John 3:16"
				autocomplete="off"
				bind:this={referenceInputElement}
				bind:value={referenceInput}
				onkeydown={handleReferenceKeydown}
			/>

			{#if referenceInput}
				<button
					class="reference-search__clear"
					type="button"
					aria-label="Clear"
					onclick={handleClear}
				>
					<span aria-hidden="true">×</span>
				</button>
			{/if}
		</div>
		<button type="submit">Lookup</button>
	</form>

	{#if referenceInput === ''}
		<RecentLookupList
			lookups={recentLookups}
			onSelect={handleRecentLookupSelect}
			onClear={handleClearRecentLookups}
		/>
	{/if}

	{#if offlineStorageStatus === 'unavailable'}
		<p role="status">
			Offline storage is unavailable. This translation will remain available for the current
			session.
		</p>
	{/if}

<PassageResult
	heading={passageHeading}
	{parseResult}
	{lookupResult}
	{copyStatus}
	onCopy={handleCopy}
/>

</main>

<style>
	.reference-search {
		position: relative;
		margin-bottom: var(--pico-spacing);
	}

	.reference-search input {
		margin-bottom: 0;
		padding-inline-end: 3.25rem;
	}

	.reference-search input::-webkit-search-cancel-button {
		appearance: none;
	}

	button.reference-search__clear {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-end: 0.25rem;
		transform: translateY(-50%);
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--verski-input-text);
		font-size: 1.35rem;
		line-height: 1;
	}

	button.reference-search__clear:hover {
		background: var(--verski-surface);
	}

	button.reference-search__clear:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: -2px;
	}
</style>
