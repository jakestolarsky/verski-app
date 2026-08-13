<script lang="ts">
	import { addRecentLookup } from '$lib/application/add-recent-lookup';
	import { clearRecentLookups } from '$lib/application/clear-recent-lookups';
	import { formatBibleReference } from '$lib/application/format-bible-reference';
	import { formatPassageForCopy } from '$lib/application/format-passage-for-copy';
	import { lookupPassage, type LookupPassageResult } from '$lib/application/lookup-passage';
	import { recordRecentLookup } from '$lib/application/record-recent-lookup';
	import { bibleBooks } from '$lib/domain/bible-book';
	import type { BibleReference } from '$lib/domain/bible-reference';
	import { parseReference, type ParseReferenceResult } from '$lib/domain/parser/parse-reference';
	import type { RecentLookup } from '$lib/domain/recent-lookup';
	import type { BibleRepository } from '$lib/storage/bible-repository';
	import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';
	import PassageResult from './PassageResult.svelte';
	import RecentLookupList from './RecentLookupList.svelte';
	import ReferenceSearchForm from './ReferenceSearchForm.svelte';
	import type { ReadingSettings } from '$lib/domain/user-settings';

	type ReferenceSearchFormHandle = {
		focus: () => void;
	};

	type CopyStatus = 'idle' | 'copied' | 'error';

	type Props = {
		repository: BibleRepository;
		translationId: string;
		translationName: string;
		recentLookups: RecentLookup[];
		recentLookupStore: RecentLookupStore | null;
		readingSettings: ReadingSettings;
	};

	let {
		repository,
		translationId,
		translationName,
		recentLookups = $bindable(),
		recentLookupStore = $bindable(),
		readingSettings,
	}: Props = $props();

	let referenceInput = $state('');
	let referenceSearchForm = $state<ReferenceSearchFormHandle>();
	let parseResult = $state<ParseReferenceResult | null>(null);
	let lookupResult = $state<LookupPassageResult | null>(null);
	let copyStatus = $state<CopyStatus>('idle');

	const passageHeading = $derived.by(() => {
		const currentParseResult = parseResult;
		const currentLookupResult = lookupResult;

		if (!currentParseResult?.ok || !currentLookupResult?.ok) {
			return 'Passage';
		}

		const bookName = getBookName(currentLookupResult.passage.bookId);
		const reference = formatBibleReference(currentParseResult.reference, bookName);

		return `${reference} (${translationName})`;
	});

	function getBookName(bookId: string): string {
		return bibleBooks.find((book) => book.id === bookId)?.names[0] ?? bookId;
	}

	async function performLookup(reference: BibleReference) {
		parseResult = {
			ok: true,
			reference
		};
		lookupResult = null;
		copyStatus = 'idle';

		const nextLookupResult = await lookupPassage(repository, translationId, reference);

		lookupResult = nextLookupResult;

		if (!nextLookupResult.ok) {
			return;
		}

		const recentLookup: RecentLookup = {
			translationId,
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
			translationName
		});

		try {
			await navigator.clipboard.writeText(text);
			copyStatus = 'copied';
		} catch {
			copyStatus = 'error';
		}
	}
</script>

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

<PassageResult
	heading={passageHeading}
	{parseResult}
	{lookupResult}
	{copyStatus}
	{readingSettings}
	onCopy={handleCopy}
/>
