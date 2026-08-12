import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '../domain/recent-lookup';
import type { RecentLookupStore } from '../storage/recent-lookup-store';
import { recordRecentLookup } from './record-recent-lookup';

describe('recordRecentLookup', () => {
	it('loads the current history and replaces it with the updated history', async () => {
		const olderLookup: RecentLookup = {
			translationId: 'engwebp',
			reference: {
				bookId: 'john',
				chapter: 1
			},
			searchedAt: 1
		};

		const newLookup: RecentLookup = {
			translationId: 'engwebp',
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			},
			searchedAt: 2
		};

		let savedLookups: readonly RecentLookup[] = [];

		const store: RecentLookupStore = {
			async getRecentLookups() {
				return [olderLookup];
			},

			async replaceRecentLookups(lookups) {
				savedLookups = [...lookups];
			}
		};

		const result = await recordRecentLookup(store, newLookup);

		expect(savedLookups).toEqual([newLookup, olderLookup]);
		expect(result).toEqual([newLookup, olderLookup]);
	});
});
