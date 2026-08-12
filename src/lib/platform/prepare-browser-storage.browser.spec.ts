import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '../domain/recent-lookup';
import type { TranslationPackage } from '../domain/translation-package';
import { IndexedDbRecentLookupStore } from '../storage/indexed-db/indexed-db-recent-lookup-store';
import { openBibleDatabase } from '../storage/indexed-db/open-bible-database';
import { prepareBrowserStorage } from './prepare-browser-storage';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		license: 'Public Domain',
		licenseUrl: 'https://ebible.org/legal.php',
		source: 'https://ebible.org',
		sourceChecksum: 'sha256:test',
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	chapters: [
		{
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: ['First verse.', 'Second verse.']
		}
	]
} satisfies TranslationPackage;

describe('prepareBrowserStorage', () => {
	it('prepares Bible data and merges session history with stored history', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const storedLookup = {
			translationId: 'engwebp',
			reference: {
				bookId: 'john',
				chapter: 1
			},
			searchedAt: 1
		} satisfies RecentLookup;

		const sessionLookup = {
			translationId: 'engwebp',
			reference: {
				bookId: 'john',
				chapter: 1,
				verseStart: 2
			},
			searchedAt: 2
		} satisfies RecentLookup;

		const database = await openBibleDatabase(databaseName);
		const historyStore = new IndexedDbRecentLookupStore(database);

		await historyStore.replaceRecentLookups([storedLookup]);

		database.close();

		const storage = await prepareBrowserStorage(translationPackage, [sessionLookup], databaseName);

		expect(storage.recentLookups).toEqual([sessionLookup, storedLookup]);

		await expect(storage.bibleRepository.getChapter('engwebp', 'john', 1)).resolves.toEqual(
			translationPackage.chapters[0]
		);

		await expect(storage.recentLookupStore?.getRecentLookups()).resolves.toEqual([
			sessionLookup,
			storedLookup
		]);

		storage.close();
	});
});
