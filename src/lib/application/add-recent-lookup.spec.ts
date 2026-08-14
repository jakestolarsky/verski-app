import { describe, expect, it } from 'vitest';

import type { BibleReference } from '$lib/domain/bible-reference';
import type { RecentLookup } from '$lib/domain/recent-lookup';
import { addRecentLookup, MAX_RECENT_LOOKUPS } from './add-recent-lookup';

function createLookup(
	reference: BibleReference,
	searchedAt: number,
	translationId = 'engwebp'
): RecentLookup {
	return {
		translationId,
		reference,
		searchedAt
	};
}

describe('addRecentLookup', () => {
	it('places a new lookup before older entries', () => {
		const olderLookup = createLookup({ bookId: 'john', chapter: 1 }, 1);
		const newLookup = createLookup({ bookId: 'john', chapter: 3 }, 2);
		const currentLookups = [olderLookup];

		const result = addRecentLookup(currentLookups, newLookup);

		expect(result).toEqual([newLookup, olderLookup]);
		expect(currentLookups).toEqual([olderLookup]);
	});

	it('moves a repeated reference to the beginning without creating a duplicate', () => {
		const reference = {
			bookId: 'john',
			chapter: 3,
			verseStart: 16
		};
		const previousLookup = createLookup(reference, 1);
		const otherLookup = createLookup({ bookId: 'john', chapter: 1 }, 2);
		const repeatedLookup = createLookup(reference, 3);

		expect(addRecentLookup([otherLookup, previousLookup], repeatedLookup)).toEqual([
			repeatedLookup,
			otherLookup
		]);
	});

	it('keeps a chapter and a verse from that chapter as separate entries', () => {
		const chapterLookup = createLookup({ bookId: 'john', chapter: 3 }, 1);
		const verseLookup = createLookup(
			{
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			},
			2
		);

		expect(addRecentLookup([chapterLookup], verseLookup)).toEqual([verseLookup, chapterLookup]);
	});

	it('keeps the same reference from different translations as separate entries', () => {
		const reference = { bookId: 'john', chapter: 3 };
		const englishLookup = createLookup(reference, 1, 'engwebp');
		const polishLookup = createLookup(reference, 2, 'polish-translation');

		expect(addRecentLookup([englishLookup], polishLookup)).toEqual([polishLookup, englishLookup]);
	});

	it(`keeps at most ${MAX_RECENT_LOOKUPS} entries`, () => {
		const currentLookups = Array.from({ length: MAX_RECENT_LOOKUPS }, (_, index) =>
			createLookup({ bookId: 'john', chapter: index + 1 }, MAX_RECENT_LOOKUPS - index)
		);
		const newLookup = createLookup(
			{ bookId: 'john', chapter: MAX_RECENT_LOOKUPS + 1 },
			MAX_RECENT_LOOKUPS + 1
		);

		const result = addRecentLookup(currentLookups, newLookup);

		expect(result).toHaveLength(MAX_RECENT_LOOKUPS);
		expect(result.map((lookup) => lookup.reference.chapter)).toEqual([4, 1, 2]);
	});
});
