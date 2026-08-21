export const CHAPTER_STORE_NAME = 'chapters';
export const TRANSLATION_STORE_NAME = 'translations';
export const RECENT_LOOKUP_STORE_NAME = 'recent-lookups';
export const SETTINGS_STORE_NAME = 'settings';

const BIBLE_DATABASE_VERSION = 5;
export const CHAPTER_TRANSLATION_INDEX_NAME = 'by-translation-id';

export function openBibleDatabase(databaseName = 'verski-bible'): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(databaseName, BIBLE_DATABASE_VERSION);

		request.onupgradeneeded = () => {
			const database = request.result;
			const upgradeTransaction = request.transaction;

			if (upgradeTransaction === null) {
				throw new Error('IndexedDB upgrade transaction is unavailable');
			}

			const chapterStore = database.objectStoreNames.contains(CHAPTER_STORE_NAME)
				? upgradeTransaction.objectStore(CHAPTER_STORE_NAME)
				: database.createObjectStore(CHAPTER_STORE_NAME, {
						keyPath: ['translationId', 'bookId', 'chapter']
					});

			if (!chapterStore.indexNames.contains(CHAPTER_TRANSLATION_INDEX_NAME)) {
				chapterStore.createIndex(CHAPTER_TRANSLATION_INDEX_NAME, 'translationId', {
					unique: false
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

			if (!database.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
				database.createObjectStore(SETTINGS_STORE_NAME, {
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
