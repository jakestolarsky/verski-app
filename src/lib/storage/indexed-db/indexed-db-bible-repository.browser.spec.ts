import { describe, expect, it } from 'vitest';
import type { TranslationPackage } from '../../domain/translation-package';
import { IndexedDbBibleRepository } from './indexed-db-bible-repository';
import { openBibleDatabase } from './open-bible-database';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		license: 'Public Domain',
		attribution: 'World English Bible — Public Domain',
		licenseUrl: 'https://ebible.org/legal.php',
		source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
		sourceChecksum: 'sha256:4ea4c923cd292be353a3fc3fdf6aae75b385a8823dc9834129c20ff53f8caa70',
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

describe('IndexedDbBibleRepository', () => {
	it('installs and returns a chapter', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const database = await openBibleDatabase(databaseName);

		const repository = new IndexedDbBibleRepository(database);

		await repository.installTranslation(translationPackage);

		const result = await repository.getChapter('engwebp', 'john', 1);

		expect(result).toEqual(translationPackage.chapters[0]);

		database.close();
	});

	it('returns null when a chapter does not exist', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const database = await openBibleDatabase(databaseName);

		const repository = new IndexedDbBibleRepository(database);

		await repository.installTranslation(translationPackage);

		const result = await repository.getChapter('engwebp', 'john', 2);

		expect(result).toBeNull();

		database.close();
	});

	it('safely replaces an existing chapter', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const database = await openBibleDatabase(databaseName);

		const repository = new IndexedDbBibleRepository(database);

		await repository.installTranslation(translationPackage);

		const updatedPackage: TranslationPackage = {
			...translationPackage,
			chapters: [
				{
					...translationPackage.chapters[0],
					verses: ['Updated first verse.']
				}
			]
		};

		await repository.installTranslation(updatedPackage);

		const result = await repository.getChapter('engwebp', 'john', 1);

		expect(result?.verses).toEqual(['Updated first verse.']);

		database.close();
	});

	it('stores the manifest of an installed translation', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;

		const database = await openBibleDatabase(databaseName);

		const repository = new IndexedDbBibleRepository(database);

		await repository.installTranslation(translationPackage);

		const result = await repository.getTranslationManifest('engwebp');

		expect(result).toEqual(translationPackage.manifest);

		database.close();
	});

	it('counts installed chapters by translation', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const repository = new IndexedDbBibleRepository(database);

		await repository.installTranslation(translationPackage);

		await expect(repository.getInstalledChapterCount('engwebp')).resolves.toBe(
			translationPackage.chapters.length
		);

		await expect(repository.getInstalledChapterCount('missing-translation')).resolves.toBe(0);

		database.close();
	});

	it('removes chapters that are absent from a replacement package', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const repository = new IndexedDbBibleRepository(database);

		const packageWithExtraChapter = {
			...translationPackage,
			chapters: [
				...translationPackage.chapters,
				{
					translationId: 'engwebp',
					bookId: 'john',
					chapter: 2,
					verses: ['Extra chapter.']
				}
			]
		} satisfies TranslationPackage;

		await repository.installTranslation(packageWithExtraChapter);
		await repository.installTranslation(translationPackage);

		await expect(repository.getChapter('engwebp', 'john', 2)).resolves.toBeNull();

		await expect(repository.getInstalledChapterCount('engwebp')).resolves.toBe(
			translationPackage.chapters.length
		);

		database.close();
	});

	it('removes only the requested translation', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const repository = new IndexedDbBibleRepository(database);

		const polishTranslationPackage = {
			manifest: {
				...translationPackage.manifest,
				id: 'polubg',
				name: 'Uwspółcześniona Biblia Gdańska',
				language: 'pl-PL'
			},
			chapters: translationPackage.chapters.map((chapter) => ({
				...chapter,
				translationId: 'polubg',
				verses: ['Na początku było Słowo.']
			}))
		} satisfies TranslationPackage;

		await repository.installTranslation(translationPackage);
		await repository.installTranslation(polishTranslationPackage);

		await repository.removeTranslation('polubg');

		await expect(repository.getTranslationManifest('polubg')).resolves.toBeNull();

		await expect(repository.getInstalledChapterCount('polubg')).resolves.toBe(0);

		await expect(repository.getChapter('polubg', 'john', 1)).resolves.toBeNull();

		await expect(repository.getTranslationManifest('engwebp')).resolves.toEqual(
			translationPackage.manifest
		);

		await expect(repository.getChapter('engwebp', 'john', 1)).resolves.toEqual(
			translationPackage.chapters[0]
		);

		await expect(repository.removeTranslation('polubg')).resolves.toBeUndefined();

		database.close();
	});
});
