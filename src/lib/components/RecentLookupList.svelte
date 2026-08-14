<script lang="ts">
	import { formatBibleReference } from '$lib/application/format-bible-reference';
	import { bibleBooks } from '$lib/domain/bible-book';
	import type { RecentLookup } from '$lib/domain/recent-lookup';

	/* icons */
	import XIcon from '@lucide/svelte/icons/x';
	import RotateCcwClockIcon from '@lucide/svelte/icons/rotate-ccw-clock';

	type Props = {
		lookups: readonly RecentLookup[];
		onSelect: (lookup: RecentLookup) => void;
		onRemove: (lookup: RecentLookup) => void | Promise<void>;
		onClear: () => void;
	};

	let { lookups, onSelect, onRemove, onClear }: Props = $props();

	function getBookName(bookId: string): string {
		return bibleBooks.find((book) => book.id === bookId)?.names[0] ?? bookId;
	}

	function getLookupLabel(lookup: RecentLookup): string {
		const bookName = getBookName(lookup.reference.bookId);

		return formatBibleReference(lookup.reference, bookName);
	}

	function getLookupKey(lookup: RecentLookup): string {
		const reference = lookup.reference;

		return [
			lookup.translationId,
			reference.bookId,
			reference.chapter,
			reference.verseStart ?? '',
			reference.verseEnd ?? ''
		].join(':');
	}
</script>

{#if lookups.length > 0}
	<section class="recent-lookups" aria-labelledby="recent-lookups-heading">
		<header class="recent-lookups__header">
			<h2 id="recent-lookups-heading" aria-label="Recent lookups">
				<RotateCcwClockIcon aria-hidden="true" />
				<span aria-hidden="true">Recent</span>
			</h2>
			<button class="secondary outline" type="button" onclick={onClear}> Clear history </button>
		</header>

		<ul class="recent-lookups__items">
			{#each lookups as lookup (getLookupKey(lookup))}
				<li>
					<button
						class="recent-lookups__remove secondary outline"
						type="button"
						aria-label={`Remove ${getLookupLabel(lookup)} from recent lookups`}
						onclick={() => onRemove(lookup)}
					>
						<XIcon aria-hidden="true" />
					</button>
					<button
						class="recent-lookups__item secondary outline"
						type="button"
						onclick={() => onSelect(lookup)}
					>
						{getLookupLabel(lookup)}
					</button>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.recent-lookups {
		width: 100%;
		max-width: 26rem;
		margin: var(--pico-spacing) auto;
	}

	.recent-lookups__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--pico-spacing);
	}

	.recent-lookups__header h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-family: var(--verski-font-display);
		font-size: 1.75rem;
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
	}

	.recent-lookups__header h2 :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.recent-lookups__header button {
		width: auto;
		margin: 0;
	}

	.recent-lookups__items {
		display: grid;
		gap: 0.125rem;
		margin-top: 0.75rem;
		padding: 0;
		list-style: none;
	}

	button.recent-lookups__item {
		width: 100%;
		margin: 0;
		padding: 0.5rem 0.25rem;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		font-weight: var(--verski-font-weight-medium);
		text-align: start;
	}

	button.recent-lookups__item:hover {
		background: transparent;
		color: var(--verski-primary);
	}

	button.recent-lookups__remove {
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
	}

	button.recent-lookups__remove:hover {
		background: var(--verski-state-hover-background);
	}

	button.recent-lookups__item:focus-visible,
	button.recent-lookups__remove:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	.recent-lookups__items li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.25rem;
		margin: 0;
	}
</style>
