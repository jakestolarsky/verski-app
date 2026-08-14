import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '$lib/domain/recent-lookup';
import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';
import { removeRecentLookup, withoutRecentLookup } from './remove-recent-lookup';

const firstLookup = {
	translationId: 'engwebp',
	reference: {
		bookId: 'john',
		chapter: 1
	},
	searchedAt: 1
} satisfies RecentLookup;

const secondLookup = {
	translationId: 'engwebp',
	reference: {
		bookId: 'john',
		chapter: 3,
		verseStart: 16
	},
	searchedAt: 2
} satisfies RecentLookup;

describe('removeRecentLookup', () => {
	it('removes the selected lookup without mutating the current list', () => {
		const currentLookups = [secondLookup, firstLookup];

		const result = withoutRecentLookup(currentLookups, firstLookup);

		expect(result).toEqual([secondLookup]);
		expect(currentLookups).toEqual([secondLookup, firstLookup]);
	});

	it('persists and returns the updated history', async () => {
		let savedLookups: readonly RecentLookup[] = [];

		const store: RecentLookupStore = {
			async getRecentLookups() {
				return [secondLookup, firstLookup];
			},

			async replaceRecentLookups(lookups) {
				savedLookups = [...lookups];
			}
		};

		const result = await removeRecentLookup(store, firstLookup);

		expect(savedLookups).toEqual([secondLookup]);
		expect(result).toEqual([secondLookup]);
	});
});
