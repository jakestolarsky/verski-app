import type {
	ChapterRecord,
	TranslationManifest,
	TranslationPackage
} from '../../domain/translation-package';
import type { TranslationStore } from '../translation-store';
import {
	CHAPTER_STORE_NAME,
	CHAPTER_TRANSLATION_INDEX_NAME,
	TRANSLATION_STORE_NAME
} from './open-bible-database';

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => {
			resolve();
		};

		transaction.onerror = () => {
			reject(transaction.error ?? new Error('IndexedDB transaction failed'));
		};

		transaction.onabort = () => {
			reject(transaction.error ?? new Error('IndexedDB transaction was aborted'));
		};
	});
}

export class IndexedDbBibleRepository implements TranslationStore {
	constructor(private readonly database: IDBDatabase) {}

	async installTranslation(translationPackage: TranslationPackage): Promise<void> {
		const transaction = this.database.transaction(
			[CHAPTER_STORE_NAME, TRANSLATION_STORE_NAME],
			'readwrite'
		);

		const completion = waitForTransaction(transaction);
		const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);
		const translationStore = transaction.objectStore(TRANSLATION_STORE_NAME);
		const translationIndex = chapterStore.index(CHAPTER_TRANSLATION_INDEX_NAME);

		const cursorRequest = translationIndex.openCursor(
			IDBKeyRange.only(translationPackage.manifest.id)
		);

		cursorRequest.onsuccess = () => {
			const cursor = cursorRequest.result;

			if (cursor !== null) {
				cursor.delete();
				cursor.continue();
				return;
			}

			translationStore.put(translationPackage.manifest);

			for (const chapter of translationPackage.chapters) {
				chapterStore.put(chapter);
			}
		};

		await completion;
	}

	async removeTranslation(translationId: string): Promise<void> {
		const transaction = this.database.transaction(
			[CHAPTER_STORE_NAME, TRANSLATION_STORE_NAME],
			'readwrite'
		);

		const completion = waitForTransaction(transaction);
		const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);
		const translationStore = transaction.objectStore(TRANSLATION_STORE_NAME);
		const translationIndex = chapterStore.index(CHAPTER_TRANSLATION_INDEX_NAME);

		const cursorRequest = translationIndex.openCursor(IDBKeyRange.only(translationId));

		cursorRequest.onsuccess = () => {
			const cursor = cursorRequest.result;

			if (cursor !== null) {
				cursor.delete();
				cursor.continue();
				return;
			}

			translationStore.delete(translationId);
		};

		await completion;
	}
	getInstalledChapterCount(translationId: string): Promise<number> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(CHAPTER_STORE_NAME, 'readonly');
			const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);
			const translationIndex = chapterStore.index(CHAPTER_TRANSLATION_INDEX_NAME);
			const request = translationIndex.count(translationId);

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to count installed Bible chapters'));
			};
		});
	}

	getChapter(
		translationId: string,
		bookId: string,
		chapter: number
	): Promise<ChapterRecord | null> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(CHAPTER_STORE_NAME, 'readonly');

			const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);

			const request = chapterStore.get([translationId, bookId, chapter]);

			request.onsuccess = () => {
				resolve((request.result as ChapterRecord | undefined) ?? null);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to read a Bible chapter'));
			};
		});
	}

	getTranslationManifest(translationId: string): Promise<TranslationManifest | null> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(TRANSLATION_STORE_NAME, 'readonly');

			const translationStore = transaction.objectStore(TRANSLATION_STORE_NAME);

			const request = translationStore.get(translationId);

			request.onsuccess = () => {
				resolve((request.result as TranslationManifest | undefined) ?? null);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to read a translation manifest'));
			};
		});
	}

	getInstalledTranslationManifests(): Promise<TranslationManifest[]> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(TRANSLATION_STORE_NAME, 'readonly');

			const translationStore = transaction.objectStore(TRANSLATION_STORE_NAME);

			const request = translationStore.getAll();

			request.onsuccess = () => {
				resolve(request.result as TranslationManifest[]);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to read installed translation manifests'));
			};
		});
	}

	async getTranslationPackage(translationId: string): Promise<TranslationPackage | null> {
		const transaction = this.database.transaction(
			[CHAPTER_STORE_NAME, TRANSLATION_STORE_NAME],
			'readonly'
		);

		const completion = waitForTransaction(transaction);

		const translationStore = transaction.objectStore(TRANSLATION_STORE_NAME);

		const chapterStore = transaction.objectStore(CHAPTER_STORE_NAME);

		const translationIndex = chapterStore.index(CHAPTER_TRANSLATION_INDEX_NAME);

		const manifestRequest = translationStore.get(translationId);

		const chaptersRequest = translationIndex.getAll(IDBKeyRange.only(translationId));

		await completion;

		const manifest = manifestRequest.result as TranslationManifest | undefined;

		if (manifest === undefined) {
			return null;
		}

		return {
			manifest,
			chapters: chaptersRequest.result as ChapterRecord[]
		};
	}
}
