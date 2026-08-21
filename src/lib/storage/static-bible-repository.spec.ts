import { describe, expect, it } from 'vitest';
import type { TranslationPackage } from '../domain/translation-package';
import { StaticBibleRepository } from './static-bible-repository';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		attribution: 'World English Bible — Public Domain',
		license: 'Public Domain',
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

describe('StaticBibleRepository', () => {
	it('returns a requested chapter', async () => {
		const repository = new StaticBibleRepository(translationPackage);

		const result = await repository.getChapter('engwebp', 'john', 1);

		expect(result).toEqual(translationPackage.chapters[0]);
	});

	it.each([
		{
			kind: 'translation',
			translationId: 'another-translation',
			bookId: 'john',
			chapter: 1
		},
		{
			kind: 'book',
			translationId: 'engwebp',
			bookId: 'romans',
			chapter: 1
		},
		{
			kind: 'chapter',
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 2
		}
	])(
		'returns null when the requested $kind does not exist',
		async ({ translationId, bookId, chapter }) => {
			const repository = new StaticBibleRepository(translationPackage);

			const result = await repository.getChapter(translationId, bookId, chapter);

			expect(result).toBeNull();
		}
	);
});
