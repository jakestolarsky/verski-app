<script lang="ts">
	import { formatBibleReference } from '$lib/application/format-bible-reference';
	import { bibleBooks } from '$lib/domain/bible-book';
	import type { RecentLookup } from '$lib/domain/recent-lookup';

	type Props = {
		lookups: readonly RecentLookup[];
		onSelect: (lookup: RecentLookup) => void;
		onClear: () => void;
	};

	let { lookups, onSelect, onClear }: Props = $props();

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

	.recent-lookups__items li {
		margin: 0;
	}

	.recent-lookups__item {
		width: 100%;
		margin: 0;
		text-align: start;
	}
</style>
