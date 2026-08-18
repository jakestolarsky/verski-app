<script lang="ts">
	import { tick } from 'svelte';
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
	import { removeRecentLookup, withoutRecentLookup } from '$lib/application/remove-recent-lookup';
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
		activeReference?: BibleReference | null;
	};

	let {
		repository,
		translationId,
		translationName,
		recentLookups = $bindable(),
		recentLookupStore = $bindable(),
		readingSettings,
		activeReference = $bindable(null)
	}: Props = $props();

	let isSearchExpanded = $state(true);
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

	async function performLookup(reference: BibleReference): Promise<boolean> {
		parseResult = {
			ok: true,
			reference
		};
		activeReference = null;
		copyStatus = 'idle';

		const nextLookupResult = await lookupPassage(repository, translationId, reference);

		lookupResult = nextLookupResult;

		if (!nextLookupResult.ok) {
			isSearchExpanded = true;
			return false;
		}
		activeReference = reference;
		isSearchExpanded = false;

		const recentLookup: RecentLookup = {
			translationId,
			reference,
			searchedAt: Date.now()
		};

		const historyStore = recentLookupStore;

		if (historyStore === null) {
			recentLookups = addRecentLookup(recentLookups, recentLookup);
			return true;
		}

		try {
			recentLookups = await recordRecentLookup(historyStore, recentLookup);
		} catch {
			recentLookupStore = null;
			recentLookups = addRecentLookup(recentLookups, recentLookup);
		}

		return true;
	}

	export async function openChapter(bookId: string, chapter: number): Promise<boolean> {
		const reference: BibleReference = {
			bookId,
			chapter
		};

		referenceInput = formatBibleReference(reference, getBookName(bookId));

		return performLookup(reference);
	}

	async function handleSubmit(input: string) {
		const nextParseResult = parseReference(input);

		if (!nextParseResult.ok) {
			parseResult = nextParseResult;
			lookupResult = null;
			activeReference = null;
			copyStatus = 'idle';
			isSearchExpanded = true;
			return;
		}

		await performLookup(nextParseResult.reference);
	}

	function handleClear() {
		parseResult = null;
		lookupResult = null;
		copyStatus = 'idle';
		activeReference = null;
		isSearchExpanded = true;
	}

	async function handleRecentLookupSelect(lookup: RecentLookup) {
		const bookName = getBookName(lookup.reference.bookId);

		referenceInput = formatBibleReference(lookup.reference, bookName);

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

	async function handleRecentLookupRemove(lookup: RecentLookup) {
		const historyStore = recentLookupStore;

		if (historyStore === null) {
			recentLookups = withoutRecentLookup(recentLookups, lookup);
			referenceSearchForm?.focus();
			return;
		}

		try {
			recentLookups = await removeRecentLookup(historyStore, lookup);
		} catch {
			recentLookupStore = null;
			recentLookups = withoutRecentLookup(recentLookups, lookup);
		}

		referenceSearchForm?.focus();
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

	async function handleSearchExpand() {
		isSearchExpanded = true;

		await tick();
		referenceSearchForm?.focus();
	}
</script>

<div class="lookup-workspace">
	{#if referenceInput === ''}
		<RecentLookupList
			lookups={recentLookups}
			onSelect={handleRecentLookupSelect}
			onRemove={handleRecentLookupRemove}
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

	<div class="lookup-workspace__search">
		<ReferenceSearchForm
			bind:this={referenceSearchForm}
			bind:value={referenceInput}
			collapsed={!isSearchExpanded}
			onSubmit={handleSubmit}
			onClear={handleClear}
			onExpand={handleSearchExpand}
		/>
	</div>
</div>

<style>
	.lookup-workspace {
		width: 100%;
		padding-block-end: calc(3.25rem + 2 * var(--pico-spacing));
	}

	.lookup-workspace__search {
		position: fixed;
		inset-block-end: max(var(--verski-shell-padding-block), env(safe-area-inset-bottom, 0px));
		inset-inline-start: 50%;
		z-index: var(--verski-layer-header);
		width: 100%;
		max-width: var(--verski-shell-max-width);
		padding-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		padding-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
		transform: translateX(-50%);
		pointer-events: none;
	}

	.lookup-workspace__search :global(form),
	.lookup-workspace__search :global(.reference-search-trigger) {
		pointer-events: auto;
	}
</style>
