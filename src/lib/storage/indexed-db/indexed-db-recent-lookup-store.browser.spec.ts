import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '../../domain/recent-lookup';
import { IndexedDbRecentLookupStore } from './indexed-db-recent-lookup-store';
import { openBibleDatabase } from './open-bible-database';

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

describe('IndexedDbRecentLookupStore', () => {
	it('returns an empty list when history has not been saved', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbRecentLookupStore(database);

		const result = await store.getRecentLookups();

		expect(result).toEqual([]);

		database.close();
	});

	it('stores and returns recent lookups in their original order', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbRecentLookupStore(database);

		await store.replaceRecentLookups([secondLookup, firstLookup]);

		const result = await store.getRecentLookups();

		expect(result).toEqual([secondLookup, firstLookup]);

		database.close();
	});

	it('replaces the previously stored history', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbRecentLookupStore(database);

		await store.replaceRecentLookups([firstLookup]);
		await store.replaceRecentLookups([secondLookup]);

		const result = await store.getRecentLookups();

		expect(result).toEqual([secondLookup]);

		database.close();
	});

	it('can replace the history with an empty list', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbRecentLookupStore(database);

		await store.replaceRecentLookups([firstLookup]);
		await store.replaceRecentLookups([]);

		const result = await store.getRecentLookups();

		expect(result).toEqual([]);

		database.close();
	});
});
