import { describe, expect, it } from 'vitest';

import type { RecentLookup } from '../domain/recent-lookup';
import type { TranslationPackage } from '../domain/translation-package';
import { IndexedDbRecentLookupStore } from '../storage/indexed-db/indexed-db-recent-lookup-store';
import { CHAPTER_STORE_NAME, openBibleDatabase } from '../storage/indexed-db/open-bible-database';
import { prepareBrowserStorage } from './prepare-browser-storage';
import { defaultUserSettings } from '../domain/user-settings';
import { IndexedDbUserSettingsStore } from '../storage/indexed-db/indexed-db-user-settings-store';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		attribution: 'World English Bible — Public Domain',
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

const polishTranslationPackage = {
	manifest: {
		id: 'polubg',
		name: 'Uwspółcześniona Biblia Gdańska',
		language: 'pl-PL',
		version: '2025-12-12',
		attribution: '© 2018 Fundacja Wrota Nadziei',
		license: 'CC BY-ND 4.0',
		licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
		source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
		sourceChecksum: 'sha256:15260b7b551446def9e253cd1ce1ef145bbfcdb9d172f4cf6f9f671d21f2c2cf',
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	chapters: [
		{
			translationId: 'polubg',
			bookId: 'john',
			chapter: 1,
			verses: ['Na początku było Słowo.']
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

		const storage = await prepareBrowserStorage(
			[translationPackage],
			[sessionLookup],
			databaseName
		);

		expect(storage.recentLookups).toEqual([sessionLookup, storedLookup]);

		await expect(storage.bibleRepository.getChapter('engwebp', 'john', 1)).resolves.toEqual(
			translationPackage.chapters[0]
		);

		await expect(storage.recentLookupStore?.getRecentLookups()).resolves.toEqual([
			sessionLookup,
			storedLookup
		]);

		expect(storage.userSettings).toEqual(defaultUserSettings);
		expect(storage.userSettingsStore).not.toBeNull();

		await expect(storage.userSettingsStore?.getStoredUserSettings()).resolves.toEqual(
			defaultUserSettings
		);

		storage.close();
	});

	it('loads previously stored user settings', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const settingsStore = new IndexedDbUserSettingsStore(database);

		await settingsStore.replaceUserSettings({
			version: 1,
			theme: 'dark',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		});

		database.close();

		const storage = await prepareBrowserStorage([translationPackage], [], databaseName);

		expect(storage.userSettings).toEqual({
			version: 1,
			theme: 'dark',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		});

		storage.close();
	});

	it('restores a bundled translation when one of its stored chapters is missing', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const initialStorage = await prepareBrowserStorage([translationPackage], [], databaseName);
		initialStorage.close();

		const database = await openBibleDatabase(databaseName);

		await new Promise<void>((resolve, reject) => {
			const transaction = database.transaction(CHAPTER_STORE_NAME, 'readwrite');

			transaction.objectStore(CHAPTER_STORE_NAME).delete(['engwebp', 'john', 1]);

			transaction.oncomplete = () => {
				resolve();
			};

			transaction.onerror = () => {
				reject(transaction.error ?? new Error('Failed to delete the test chapter'));
			};

			transaction.onabort = () => {
				reject(transaction.error ?? new Error('Deleting the test chapter was aborted'));
			};
		});

		database.close();

		const recoveredStorage = await prepareBrowserStorage([translationPackage], [], databaseName);

		await expect(
			recoveredStorage.bibleRepository.getChapter('engwebp', 'john', 1)
		).resolves.toEqual(translationPackage.chapters[0]);

		recoveredStorage.close();
	});

	it('prepares every bundled translation package', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const storage = await prepareBrowserStorage(
			[translationPackage, polishTranslationPackage],
			[],
			databaseName
		);

		expect(storage.installedTranslationManifests).toEqual([
			translationPackage.manifest,
			polishTranslationPackage.manifest
		]);

		await expect(storage.bibleRepository.getChapter('engwebp', 'john', 1)).resolves.toEqual(
			translationPackage.chapters[0]
		);

		await expect(storage.bibleRepository.getChapter('polubg', 'john', 1)).resolves.toEqual(
			polishTranslationPackage.chapters[0]
		);

		storage.close();
	});

	it('rejects preparing storage without a translation package', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		await expect(prepareBrowserStorage([], [], databaseName)).rejects.toThrowError(
			'At least one translation package is required'
		);
	});
});
