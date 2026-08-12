import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '../domain/recent-lookup';
import type { RecentLookupStore } from '../storage/recent-lookup-store';
import { clearRecentLookups } from './clear-recent-lookups';

describe('clearRecentLookups', () => {
	it('replaces the current history with an empty list', async () => {
		let savedLookups: RecentLookup[] = [
			{
				translationId: 'engwebp',
				reference: {
					bookId: 'john',
					chapter: 3
				},
				searchedAt: 1
			}
		];

		const store: RecentLookupStore = {
			async getRecentLookups() {
				return savedLookups;
			},

			async replaceRecentLookups(lookups) {
				savedLookups = [...lookups];
			}
		};

		await clearRecentLookups(store);

		expect(savedLookups).toEqual([]);
	});
});
