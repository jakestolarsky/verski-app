<script lang="ts">
	import { formatBibleReference } from '$lib/application/format-bible-reference';
	import { bibleBooks } from '$lib/domain/bible-book';
	import type { RecentLookup } from '$lib/domain/recent-lookup';

	import XIcon from '@lucide/svelte/icons/x';

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
			<h2 id="recent-lookups-heading">Recent lookups</h2>

			<button class="secondary outline" type="button" onclick={onClear}>Clear history</button>
		</header>

		<ul class="recent-lookups__items">
			{#each lookups as lookup (getLookupKey(lookup))}
				<li>
					<button
						class="recent-lookups__item secondary outline"
						type="button"
						onclick={() => onSelect(lookup)}
					>
						{getLookupLabel(lookup)}
					</button>
					<button
						class="recent-lookups__remove secondary outline"
						type="button"
						aria-label={`Remove ${getLookupLabel(lookup)} from recent lookups`}
						onclick={() => onRemove(lookup)}
					>
						<XIcon aria-hidden="true" />
					</button>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.recent-lookups {
		margin-block: var(--pico-spacing);
	}

	.recent-lookups__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--pico-spacing);
	}

	.recent-lookups__header h2 {
		margin: 0;
	}

	.recent-lookups__header button {
		width: auto;
		margin: 0;
	}

	.recent-lookups__items {
		display: grid;
		gap: 0.5rem;
		margin-top: var(--pico-spacing);
		padding: 0;
		list-style: none;
	}

	.recent-lookups__item {
		width: 100%;
		margin: 0;
		text-align: start;
	}

	.recent-lookups__items li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.25rem;
		margin: 0;
	}

	.recent-lookups__remove {
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border-color: transparent;
		background: transparent;
	}

	.recent-lookups__remove :global(svg) {
		width: var(--verski-icon-size-disclosure);
		height: var(--verski-icon-size-disclosure);
	}
</style>
