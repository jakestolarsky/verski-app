import { describe, expect, it } from 'vitest';
import {
	CHAPTER_STORE_NAME,
	openBibleDatabase,
	RECENT_LOOKUP_STORE_NAME,
	TRANSLATION_STORE_NAME
} from './open-bible-database';

describe('openBibleDatabase', () => {
	it('creates the chapter object store', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const database = await openBibleDatabase(databaseName);

		expect(database.objectStoreNames.contains(CHAPTER_STORE_NAME)).toBe(true);

		const transaction = database.transaction(CHAPTER_STORE_NAME, 'readonly');

		const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);

		expect(chapterStore.keyPath).toEqual(['translationId', 'bookId', 'chapter']);

		expect(database.objectStoreNames.contains(TRANSLATION_STORE_NAME)).toBe(true);

		const translationTransaction = database.transaction(TRANSLATION_STORE_NAME, 'readonly');

		const translationStore = translationTransaction.objectStore(TRANSLATION_STORE_NAME);

		expect(translationStore.keyPath).toBe('id');

		expect(database.objectStoreNames.contains(RECENT_LOOKUP_STORE_NAME)).toBe(true);

		const recentLookupTransaction = database.transaction(RECENT_LOOKUP_STORE_NAME, 'readonly');

		const recentLookupStore = recentLookupTransaction.objectStore(RECENT_LOOKUP_STORE_NAME);

		expect(recentLookupStore.keyPath).toBe('id');
		database.close();
	});
});
