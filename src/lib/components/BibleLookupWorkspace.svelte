<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { addRecentLookup } from '$lib/application/add-recent-lookup';
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
	import { expandPassageToChapterEnd } from '$lib/application/expand-passage-to-chapter-end';
	import * as m from '$lib/paraglide/messages.js';
	import { getBibleBookName } from '$lib/domain/bible-book-localization';

	type ReferenceSearchFormHandle = {
		focus: () => void;
	};

	type CopyStatus = 'idle' | 'copied' | 'error';
	const copyFeedbackDuration = 1800;
	let copyFeedbackTimeout: number | undefined;

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
	let searchContainer = $state<HTMLDivElement>();
	let keyboardInset = $state(0);

	const passageHeading = $derived.by(() => {
		const currentParseResult = parseResult;
		const currentLookupResult = lookupResult;

		if (!currentParseResult?.ok || !currentLookupResult?.ok) {
			return m.passage_heading_fallback();
		}

		const bookName = getBookName(currentLookupResult.passage.bookId);
		const reference = formatBibleReference(currentParseResult.reference, bookName);

		return reference;
	});

	const currentTranslationLookups = $derived(
		recentLookups.filter((lookup) => lookup.translationId === translationId)
	);

	onMount(() => {
		const viewport = window.visualViewport;
		const container = searchContainer;

		if (viewport === null || container === undefined) {
			return;
		}

		function updateKeyboardInset() {
			const hasSearchFocus = container?.contains(document.activeElement) ?? false;

			if (!hasSearchFocus) {
				keyboardInset = 0;
				return;
			}

			const layoutHeight = document.documentElement.clientHeight;

			keyboardInset = Math.max(0, layoutHeight - viewport!.height - viewport!.offsetTop);
		}

		viewport.addEventListener('resize', updateKeyboardInset);
		viewport.addEventListener('scroll', updateKeyboardInset);
		container.addEventListener('focusin', updateKeyboardInset);
		container.addEventListener('focusout', updateKeyboardInset);

		updateKeyboardInset();

		return () => {
			viewport.removeEventListener('resize', updateKeyboardInset);
			viewport.removeEventListener('scroll', updateKeyboardInset);
			container.removeEventListener('focusin', updateKeyboardInset);
			container.removeEventListener('focusout', updateKeyboardInset);
		};
	});

	function getBookName(bookId: string): string {
		return getBibleBookName(bookId, 'en');
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

	async function handleShowChapterRemainder() {
		const currentLookupResult = lookupResult;
		const currentParseResult = parseResult;

		if (!currentLookupResult?.ok || !currentLookupResult.hasMoreVerses || !currentParseResult?.ok) {
			return;
		}

		const expandedResult = await expandPassageToChapterEnd(repository, currentLookupResult.passage);

		if (!expandedResult.ok) {
			lookupResult = expandedResult;
			return;
		}

		const lastVerse = expandedResult.passage.verses[expandedResult.passage.verses.length - 1];

		if (lastVerse === undefined) {
			return;
		}

		const expandedReference: BibleReference = {
			...currentParseResult.reference,
			verseEnd: lastVerse.number
		};

		parseResult = {
			ok: true,
			reference: expandedReference
		};

		lookupResult = expandedResult;
		activeReference = expandedReference;
		referenceInput = formatBibleReference(expandedReference, getBookName(expandedReference.bookId));
		copyStatus = 'idle';
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

		clearCopyFeedbackTimeout();

		try {
			await navigator.clipboard.writeText(text);
			copyStatus = 'copied';
			scheduleCopyFeedbackReset();
		} catch {
			copyStatus = 'error';
		}
	}

	function clearCopyFeedbackTimeout() {
		if (copyFeedbackTimeout === undefined) {
			return;
		}

		window.clearTimeout(copyFeedbackTimeout);
		copyFeedbackTimeout = undefined;
	}

	function scheduleCopyFeedbackReset() {
		clearCopyFeedbackTimeout();

		copyFeedbackTimeout = window.setTimeout(() => {
			copyStatus = 'idle';
			copyFeedbackTimeout = undefined;
		}, copyFeedbackDuration);
	}

	onDestroy(clearCopyFeedbackTimeout);

	async function handleSearchExpand() {
		isSearchExpanded = true;

		await tick();
		referenceSearchForm?.focus();
	}
</script>

<div class="lookup-workspace">
	{#if referenceInput === ''}
		<RecentLookupList
			lookups={currentTranslationLookups}
			onSelect={handleRecentLookupSelect}
			onRemove={handleRecentLookupRemove}
		/>
	{/if}

	<PassageResult
		heading={passageHeading}
		{translationName}
		{parseResult}
		{lookupResult}
		{copyStatus}
		{readingSettings}
		onCopy={handleCopy}
		onShowChapterRemainder={handleShowChapterRemainder}
	/>

	<div
		bind:this={searchContainer}
		class="lookup-workspace__search"
		style={`--verski-keyboard-inset: ${keyboardInset}px`}
	>
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
		inset-block-end: calc(
			max(var(--verski-shell-padding-block), env(safe-area-inset-bottom, 0px)) +
				var(--verski-keyboard-inset, 0px)
		);
		inset-inline-start: 50%;
		z-index: var(--verski-layer-header);
		width: 100%;
		max-width: var(--verski-shell-max-width);
		padding-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		padding-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
		transform: translateX(-50%);
		pointer-events: none;
	}

	.lookup-workspace__search :global(form) {
		pointer-events: none;
	}
</style>
