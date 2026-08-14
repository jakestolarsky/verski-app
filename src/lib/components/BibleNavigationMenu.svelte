<script lang="ts">
	import type {
		BibleNavigationTestament,
		BibleNavigationBook
	} from '$lib/application/build-bible-navigation';
	import type { BibleTestamentId } from '$lib/domain/bible-canon';

	/* icons */
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Search from '@lucide/svelte/icons/search';

	type Props = {
		translationName: string;
		navigation: BibleNavigationTestament[];
		selectedBookId?: string | null;
		selectedChapter?: number | null;
		onChapterSelect: (bookId: string, chapter: number) => boolean | Promise<boolean>;
	};

	let {
		translationName,
		navigation,
		selectedBookId = null,
		selectedChapter = null,
		onChapterSelect
	}: Props = $props();
	let triggerElement = $state<HTMLButtonElement>();
	let dialogElement = $state<HTMLDialogElement>();
	let bookQuery = $state('');
	let expandedTestamentIds = $state<BibleTestamentId[]>([]);
	let navigationPanelElement = $state<HTMLDivElement>();
	let expandedBookId = $state<string | null>(null);
	let selectionError = $state(false);

	const filteredNavigation = $derived.by(() => {
		const query = bookQuery.trim().toLocaleLowerCase();

		if (query === '') {
			return navigation;
		}

		return navigation
			.map((testament) => ({
				...testament,
				books: testament.books.filter((book) => book.name.toLocaleLowerCase().includes(query))
			}))
			.filter((testament) => testament.books.length > 0);
	});

	function openMenu() {
		bookQuery = '';
		selectionError = false;
		expandedBookId = selectedBookId;

		const selectedTestament = navigation.find((testament) =>
			testament.books.some((book) => book.id === selectedBookId)
		);

		expandedTestamentIds = selectedTestament === undefined ? [] : [selectedTestament.id];

		dialogElement?.showModal();

		if (dialogElement !== undefined) {
			dialogElement.scrollTop = 0;
		}

		if (navigationPanelElement !== undefined) {
			navigationPanelElement.scrollTop = 0;
		}
	}

	function closeMenu() {
		dialogElement?.close();
	}

	function handleDialogClose() {
		triggerElement?.focus();
	}

	function isTestamentExpanded(testamentId: BibleTestamentId) {
		return bookQuery.trim() !== '' || expandedTestamentIds.includes(testamentId);
	}

	function toggleTestament(testamentId: BibleTestamentId) {
		if (expandedTestamentIds.includes(testamentId)) {
			expandedTestamentIds = expandedTestamentIds.filter((id) => id !== testamentId);
			return;
		}

		expandedTestamentIds = [...expandedTestamentIds, testamentId];
	}

	function toggleBook(book: BibleNavigationBook) {
		expandedBookId = expandedBookId === book.id ? null : book.id;
	}

	async function handleChapterSelect(bookId: string, chapter: number) {
		selectionError = false;

		try {
			const selected = await onChapterSelect(bookId, chapter);

			if (selected) {
				closeMenu();
				return;
			}
		} catch {
			// The dialog remains open and displays a useful error.
		}

		selectionError = true;
	}
</script>

<button
	bind:this={triggerElement}
	class="navigation-trigger secondary outline"
	type="button"
	aria-label="Open Bible navigation"
	aria-haspopup="dialog"
	onclick={openMenu}
>
	<BookOpen />
</button>

<dialog
	bind:this={dialogElement}
	class="bible-navigation"
	aria-labelledby="bible-navigation-heading"
	onclose={handleDialogClose}
>
	<div bind:this={navigationPanelElement} class="navigation-panel">
		<header class="navigation-header">
			<h2 id="bible-navigation-heading">Bible navigation</h2>

			<button
				class="navigation-close secondary outline"
				type="button"
				aria-label="Close Bible navigation"
				onclick={closeMenu}
			>
				<BookOpen />
			</button>
		</header>

		<p class="translation-name" aria-label="Current translation" aria-current="true">
			{translationName}
		</p>

		<label class="visually-hidden" for="book-filter"> Find a book </label>

		<div class="book-filter">
			<input
				id="book-filter"
				type="search"
				placeholder="Find a book..."
				autocomplete="off"
				bind:value={bookQuery}
			/>
		</div>

		{#if selectionError}
			<p class="navigation-error" role="alert">Could not open the selected chapter.</p>
		{/if}

		{#if navigation.length === 0}
			<p role="status">No Bible books are available for this translation.</p>
		{:else if filteredNavigation.length === 0}
			<p role="status">No books match your search.</p>
		{:else}
			{#each filteredNavigation as testament (testament.id)}
				<section class="testament">
					<button
						class="testament-button"
						type="button"
						aria-expanded={isTestamentExpanded(testament.id)}
						onclick={() => toggleTestament(testament.id)}
					>
						<span>{testament.name}</span>
						<span
							class="disclosure-icon"
							class:expanded={isTestamentExpanded(testament.id)}
							aria-hidden="true"
						>
							<ChevronDown />
						</span>
					</button>

					{#if isTestamentExpanded(testament.id)}
						<ul class="book-list" role="list">
							{#each testament.books as book (book.id)}
								<li>
									<button
										class="book-button"
										type="button"
										aria-expanded={expandedBookId === book.id}
										aria-current={selectedBookId === book.id ? 'true' : undefined}
										onclick={() => toggleBook(book)}
									>
										<span>{book.name}</span>
										<span
											class="disclosure-icon"
											class:expanded={expandedBookId === book.id}
											aria-hidden="true"
										>
											<ChevronDown />
										</span>
									</button>

									{#if expandedBookId === book.id}
										{#if book.chapters.length === 0}
											<p class="empty-book">No chapters available.</p>
										{:else}
											<ul class="chapter-list" role="list" aria-label={`${book.name} chapters`}>
												{#each book.chapters as chapter}
													<li>
														<button
															type="button"
															aria-label={`${book.name} ${chapter}`}
															aria-current={selectedBookId === book.id &&
															selectedChapter === chapter
																? 'page'
																: undefined}
															onclick={() => handleChapterSelect(book.id, chapter)}
														>
															{chapter}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/each}
		{/if}
	</div>
</dialog>

<style>
	.navigation-trigger,
	.navigation-close {
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border-radius: 50%;
	}

	.navigation-trigger :global(svg),
	.navigation-close :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.disclosure-icon {
		display: grid;
		place-items: center;
		transform: rotate(0deg);
	}

	.disclosure-icon.expanded {
		transform: rotate(180deg);
	}

	.disclosure-icon :global(svg) {
		width: var(--verski-icon-size-disclosure);
		height: var(--verski-icon-size-disclosure);
	}

	dialog.bible-navigation {
		width: min(28rem, 100%);
		height: 100dvh;
		max-width: 100%;
		max-height: 100dvh;
		margin: 0 auto 0 0;
		padding: 0;
		overflow: hidden;
		border: 0;
		border-radius: 0;
		background: var(--verski-background);
		color: var(--verski-text);
	}

	dialog.bible-navigation::backdrop {
		background: color-mix(in srgb, var(--verski-ink) 60%, transparent);
	}

	.navigation-panel {
		height: 100%;
		min-height: 0;
		padding: var(--pico-spacing);
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}

	.navigation-header {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		margin-bottom: var(--pico-spacing);
	}

	.navigation-header h2 {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.translation-name {
		margin-bottom: var(--pico-spacing);
		text-align: center;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.book-filter {
		margin-bottom: var(--pico-spacing);
	}

	.book-filter input {
		margin: 0;
		padding-inline-start: var(--pico-form-element-spacing-horizontal);
		background-image: none;
		-webkit-appearance: none;
	}

	.testament {
		margin-bottom: 0.5rem;
	}

	.testament-button,
	.book-button {
		display: flex;
		width: 100%;
		margin: 0;
		padding: 0.65rem 0.5rem;
		align-items: center;
		justify-content: space-between;
		border: 0;
		background: transparent;
		color: var(--verski-text);
		text-align: start;
	}

	.testament-button {
		font-size: 1.15rem;
		font-weight: 600;
	}

	.book-list,
	.chapter-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.book-list > li,
	.chapter-list > li {
		display: block;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.book-list > li::marker,
	.chapter-list > li::marker {
		content: '';
	}

	.book-button {
		padding-inline-start: 1rem;
	}

	.book-button[aria-current='true'] {
		color: var(--verski-primary);
		font-weight: 600;
	}

	.navigation-error {
		color: var(--pico-del-color);
	}

	.chapter-list {
		display: grid;
		grid-template-columns: repeat(5, minmax(2.5rem, 1fr));
		gap: 0.35rem;
		padding: 0.25rem 0.5rem 0.75rem;
	}

	.chapter-list button {
		width: 100%;
		aspect-ratio: 1;
		min-height: 2.75rem;
		margin: 0;
		padding: 0.35rem;
		border: 1px solid transparent;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
	}

	.chapter-list button:hover {
		border-color: var(--verski-muted-brown);
		background: transparent;
		color: var(--verski-text);
	}

	.chapter-list button:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	.chapter-list button[aria-current='page'] {
		border-color: var(--verski-primary);
		background: transparent;
		color: var(--verski-primary);
		font-weight: 600;
	}

	.empty-book {
		margin: 0;
		padding: 0 1rem 0.75rem;
	}

	@media (max-width: 30rem) {
		dialog.bible-navigation {
			width: 100%;
		}
	}
</style>
