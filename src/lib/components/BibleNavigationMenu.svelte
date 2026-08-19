<script lang="ts">
	import type {
		BibleNavigationTestament,
		BibleNavigationBook
	} from '$lib/application/build-bible-navigation';
	import type { BibleTestamentId } from '$lib/domain/bible-canon';

	/* icons */
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

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
	<BookOpen aria-hidden="true" />
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
				<span class="mobile-close-icon" aria-hidden="true">
					<BookOpen />
				</span>

				<span class="desktop-close-icon" aria-hidden="true">
					<ChevronLeft />
				</span>
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
							<ChevronDown aria-hidden="true" />
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
											<ChevronDown aria-hidden="true" />
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
	:global(html:has(dialog.bible-navigation[open])),
	:global(body:has(dialog.bible-navigation[open])) {
		overflow: hidden;
		overscroll-behavior: none;
	}

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

	.navigation-close {
		position: fixed;
		inset-block-start: max(var(--verski-shell-padding-block), env(safe-area-inset-top, 0px));
		inset-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		z-index: var(--verski-layer-dialog);
	}

	.mobile-close-icon,
	.desktop-close-icon {
		place-items: center;
	}

	.mobile-close-icon {
		display: grid;
	}

	.desktop-close-icon {
		display: none;
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
		box-sizing: border-box;
		inline-size: 100%;
		min-inline-size: 100%;
		max-inline-size: 100%;

		height: 100dvh;
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
		background: var(--verski-overlay-background);
	}

	.navigation-panel {
		height: 100%;
		min-height: 0;
		padding-block-start: max(var(--verski-shell-padding-block), env(safe-area-inset-top, 0px));
		padding-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		padding-block-end: max(var(--verski-shell-padding-block), env(safe-area-inset-bottom, 0px));
		padding-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
		overflow-y: auto;
		overscroll-behavior: contain;
		background: var(--verski-background);
		-webkit-overflow-scrolling: touch;

		box-sizing: border-box;
		inline-size: 100%;
		min-inline-size: 0;
		scrollbar-gutter: stable;
	}

	.navigation-header {
		display: flex;
		min-height: 2.75rem;
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
		font-family: var(--verski-font-display);
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.2;
		text-align: center;
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
		position: relative;
		margin-bottom: var(--pico-spacing);
		padding: 0.125rem;
		border-radius: var(--verski-input-radius);
		background: var(--verski-input-border);
		transition: box-shadow var(--pico-transition);
	}

	.book-filter:focus-within {
		background: var(--verski-input-border-gradient);
		box-shadow: 0 0 0 0.1875rem var(--verski-input-focus-ring);
	}

	.book-filter input {
		appearance: none;
		margin: 0;
		padding-inline: 1.25rem;
		border: 0;
		border-radius: calc(var(--verski-input-radius) - 0.125rem);
		background: var(--verski-input-background);
		box-shadow: none;
		color: var(--verski-input-text);
		caret-color: var(--verski-primary);
		transition: color var(--pico-transition);
		-webkit-appearance: none;
	}

	.book-filter input:focus {
		outline: none;
		border: 0;
		background: var(--verski-input-background);
		box-shadow: none;
	}

	.book-filter input::placeholder {
		color: var(--verski-input-placeholder);
		opacity: 1;
	}

	.book-filter input::-webkit-search-cancel-button {
		appearance: none;
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
		font-family: var(--verski-font-display);
		font-size: 1.35rem;
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.2;
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

	.book-list,
	.book-list > li,
	.chapter-list {
		min-inline-size: 0;
	}

	.book-button {
		padding-inline-start: 1rem;
		font-family: var(--verski-font-ui);
		font-style: normal;
		font-weight: var(--verski-font-weight-regular);
	}

	.book-button[aria-current='true'] {
		color: var(--verski-state-active-text);
		font-weight: var(--verski-font-weight-medium);
	}

	.navigation-error {
		color: var(--pico-del-color);
	}

	.chapter-list {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
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
		font-family: var(--verski-font-ui);
		font-weight: var(--verski-font-weight-regular);
	}

	.chapter-list button:hover {
		border-color: var(--verski-border-subtle);
		background: transparent;
		color: var(--verski-text);
	}

	.chapter-list button:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	.chapter-list button[aria-current='page'] {
		border-color: var(--verski-border-active);
		background: transparent;
		color: var(--verski-state-active-text);
		font-weight: var(--verski-font-weight-medium);
	}

	.empty-book {
		margin: 0;
		padding: 0 1rem 0.75rem;
	}

	@media (min-width: 48rem) {
		dialog.bible-navigation {
			--navigation-panel-width: clamp(32rem, 42vw, 38rem);

			inline-size: var(--navigation-panel-width);
			min-inline-size: var(--navigation-panel-width);
			max-inline-size: var(--navigation-panel-width);

			overflow: visible;
		}

		.navigation-close {
			inset-inline-end: auto;
			inset-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
			transform: none;
		}

		.mobile-close-icon {
			display: none;
		}

		.desktop-close-icon {
			display: inline-flex;
		}
	}
</style>
