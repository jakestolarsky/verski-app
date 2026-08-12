export const CHAPTER_STORE_NAME = 'chapters';
export const TRANSLATION_STORE_NAME = 'translations';
export const RECENT_LOOKUP_STORE_NAME = 'recent-lookups';

const BIBLE_DATABASE_VERSION = 3;

export function openBibleDatabase(databaseName = 'verski-bible'): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(databaseName, BIBLE_DATABASE_VERSION);

		request.onupgradeneeded = () => {
			const database = request.result;

			if (!database.objectStoreNames.contains(CHAPTER_STORE_NAME)) {
				database.createObjectStore(CHAPTER_STORE_NAME, {
					keyPath: ['translationId', 'bookId', 'chapter']
				});
			}

			if (!database.objectStoreNames.contains(TRANSLATION_STORE_NAME)) {
				database.createObjectStore(TRANSLATION_STORE_NAME, {
					keyPath: 'id'
				});
			}

			if (!database.objectStoreNames.contains(RECENT_LOOKUP_STORE_NAME)) {
				database.createObjectStore(RECENT_LOOKUP_STORE_NAME, {
					keyPath: 'id'
				});
			}
		};

		request.onsuccess = () => {
			const database = request.result;

			database.onversionchange = () => {
				database.close();
			};

			resolve(database);
		};

		request.onerror = () => {
			reject(request.error ?? new Error('Failed to open the Bible database'));
		};
	});
}
