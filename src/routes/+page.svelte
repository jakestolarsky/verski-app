<script lang="ts">
	import PassageResult from '$lib/components/PassageResult.svelte';
	import ReferenceSearchForm from '$lib/components/ReferenceSearchForm.svelte';
	import type { BibleRepository } from '$lib/storage/bible-repository';
	import {
		prepareBrowserStorage,
		type PreparedBrowserStorage
	} from '$lib/platform/prepare-browser-storage';
	import { lookupPassage, type LookupPassageResult } from '$lib/application/lookup-passage';
	import { parseReference, type ParseReferenceResult } from '$lib/domain/parser/parse-reference';
	import { StaticBibleRepository } from '$lib/storage/static-bible-repository';
	import type { PageData } from './$types';
	import { formatPassageForCopy } from '$lib/application/format-passage-for-copy';
	import { bibleBooks } from '$lib/domain/bible-book';
	import { onMount } from 'svelte';
	import { formatBibleReference } from '$lib/application/format-bible-reference';
	import { addRecentLookup } from '$lib/application/add-recent-lookup';
	import RecentLookupList from '$lib/components/RecentLookupList.svelte';
	import type { BibleReference } from '$lib/domain/bible-reference';
	import type { RecentLookup } from '$lib/domain/recent-lookup';
	import { clearRecentLookups } from '$lib/application/clear-recent-lookups';
	import { recordRecentLookup } from '$lib/application/record-recent-lookup';
	import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';

	let { data }: { data: PageData } = $props();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let persistentRepository = $state<BibleRepository | null>(null);
	const repository = $derived(persistentRepository ?? staticRepository);
	let offlineStorageStatus = $state<'preparing' | 'ready' | 'unavailable'>('preparing');

	let referenceInput = $state('');

	type ReferenceSearchFormHandle = {
		focus: () => void;
	};

	let referenceSearchForm = $state<ReferenceSearchFormHandle>();
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
		let preparedStorage: PreparedBrowserStorage | null = null;
		let disposed = false;

		void prepareBrowserStorage(data.translationPackage, recentLookups)
			.then((storage) => {
				if (disposed) {
					storage.close();
					return;
				}

				preparedStorage = storage;
				persistentRepository = storage.bibleRepository;
				recentLookupStore = storage.recentLookupStore;
				recentLookups = storage.recentLookups;
				offlineStorageStatus = 'ready';
			})
			.catch(() => {
				if (!disposed) {
					persistentRepository = null;
					recentLookupStore = null;
					offlineStorageStatus = 'unavailable';
				}
			});

		return () => {
			disposed = true;
			preparedStorage?.close();
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

	async function handleSubmit(input: string) {
		const nextParseResult = parseReference(input);

		if (!nextParseResult.ok) {
			parseResult = nextParseResult;
			lookupResult = null;
			copyStatus = 'idle';
			return;
		}

		await performLookup(nextParseResult.reference);
	}

	function handleClear() {
		parseResult = null;
		lookupResult = null;
		copyStatus = 'idle';
	}

	async function handleRecentLookupSelect(lookup: RecentLookup) {
		const bookName = getBookName(lookup.reference.bookId);

		referenceInput = formatBibleReference(lookup.reference, bookName);
		referenceSearchForm?.focus();

		await performLookup(lookup.reference);
	}

	async function handleClearRecentLookups() {
		recentLookups = [];
		referenceSearchForm?.focus();

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

	<ReferenceSearchForm
		bind:this={referenceSearchForm}
		bind:value={referenceInput}
		onSubmit={handleSubmit}
		onClear={handleClear}
	/>

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
