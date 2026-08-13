<script lang="ts">
	import type {
		BibleNavigationTestament,
		BibleNavigationBook
	} from '$lib/application/build-bible-navigation';
	import type { BibleTestamentId } from '$lib/domain/bible-canon';

	type Props = {
		translationName: string;
		navigation: BibleNavigationTestament[];
		onChapterSelect: (bookId: string, chapter: number) => boolean | Promise<boolean>;
	};

	let { translationName, navigation, onChapterSelect }: Props = $props();

	let triggerElement = $state<HTMLButtonElement>();
	let dialogElement = $state<HTMLDialogElement>();
	let bookQuery = $state('');
	let expandedTestamentIds = $state<BibleTestamentId[]>(['old', 'new']);
	let expandedBookId = $state<string | null>(null);

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
		dialogElement?.showModal();
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
		const selected = await onChapterSelect(bookId, chapter);

		if (selected) {
			closeMenu();
		}
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
	<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<rect x="5" y="3" width="14" height="18" rx="2"></rect>
		<path d="M8 7h8M8 17h8"></path>
	</svg>
</button>

<dialog
	bind:this={dialogElement}
	class="bible-navigation"
	aria-labelledby="bible-navigation-heading"
	onclose={handleDialogClose}
>
	<div class="navigation-panel">
		<header class="navigation-header">
			<h2 id="bible-navigation-heading">Bible navigation</h2>

			<button
				class="navigation-close secondary outline"
				type="button"
				aria-label="Close Bible navigation"
				onclick={closeMenu}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="5" y="3" width="14" height="18" rx="2"></rect>
					<path d="M8 7h8M8 17h8"></path>
				</svg>
			</button>
		</header>

		<p class="translation-name" aria-label="Current translation">
			{translationName}
		</p>

		<label class="visually-hidden" for="book-filter"> Find a book </label>

		<div class="book-filter">
			<input
				id="book-filter"
				type="search"
				placeholder="Find a book"
				autocomplete="off"
				bind:value={bookQuery}
			/>

			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="11" cy="11" r="7"></circle>
				<path d="m20 20-4-4"></path>
			</svg>
		</div>

		{#if filteredNavigation.length === 0}
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
						<span aria-hidden="true">
							{isTestamentExpanded(testament.id) ? '⌃' : '⌄'}
						</span>
					</button>

					{#if isTestamentExpanded(testament.id)}
						<ul class="book-list">
							{#each testament.books as book (book.id)}
								<li>
									<button
										class="book-button"
										type="button"
										aria-expanded={expandedBookId === book.id}
										onclick={() => toggleBook(book)}
									>
										<span>{book.name}</span>
										<span aria-hidden="true">
											{expandedBookId === book.id ? '⌃' : '⌄'}
										</span>
									</button>

									{#if expandedBookId === book.id}
										{#if book.chapters.length === 0}
											<p class="empty-book">No chapters available.</p>
										{:else}
											<ul class="chapter-list" aria-label={`${book.name} chapters`}>
												{#each book.chapters as chapter}
													<li>
														<button
															type="button"
															aria-label={`${book.name} ${chapter}`}
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

	.navigation-trigger svg,
	.navigation-close svg {
		width: 1.4rem;
		height: 1.4rem;
	}

	dialog.bible-navigation {
		width: min(28rem, 100%);
		height: 100dvh;
		max-width: 100%;
		max-height: 100dvh;
		margin: 0 auto 0 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: var(--verski-background);
		color: var(--verski-text);
	}

	dialog.bible-navigation::backdrop {
		background: color-mix(in srgb, var(--verski-ink) 60%, transparent);
	}

	.navigation-panel {
		min-height: 100%;
		padding: var(--pico-spacing);
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
		position: relative;
		margin-bottom: var(--pico-spacing);
	}

	.book-filter input {
		margin: 0;
		padding-inline-end: 3rem;
	}

	.book-filter svg {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-end: 0.9rem;
		width: 1.35rem;
		height: 1.35rem;
		transform: translateY(-50%);
		pointer-events: none;
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

	.book-button {
		padding-inline-start: 1rem;
	}

	.chapter-list {
		display: grid;
		grid-template-columns: repeat(5, minmax(2.5rem, 1fr));
		gap: 0.35rem;
		padding: 0.25rem 1rem 0.75rem;
	}

	.chapter-list button {
		width: 100%;
		min-height: 2.75rem;
		margin: 0;
		padding: 0.35rem;
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
