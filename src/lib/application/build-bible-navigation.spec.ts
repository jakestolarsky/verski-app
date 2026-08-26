import { describe, expect, it } from 'vitest';

import type { TranslationPackage } from '$lib/domain/translation-package';
import { buildBibleNavigation } from './build-bible-navigation';

const translationPackage = {
	manifest: {
		id: 'test',
		name: 'Test translation',
		language: 'en',
		version: '1',
		attribution: 'World English Bible — Public Domain',
		license: 'Test license',
		licenseUrl: 'https://example.com/license',
		source: 'https://example.com/source',
		sourceChecksum: 'sha256:test',
		schemaVersion: 1,
		canonId: 'catholic-73',
		bookIds: ['john', 'tobit', 'genesis', 'matthew']
	},
	chapters: [
		{
			translationId: 'test',
			bookId: 'john',
			chapter: 3,
			verses: ['John verse']
		},
		{
			translationId: 'test',
			bookId: 'genesis',
			chapter: 2,
			verses: ['Genesis 2']
		},
		{
			translationId: 'test',
			bookId: 'genesis',
			chapter: 1,
			verses: ['Genesis 1']
		},
		{
			translationId: 'test',
			bookId: 'tobit',
			chapter: 1,
			verses: ['Tobit verse']
		},
		{
			translationId: 'test',
			bookId: 'matthew',
			chapter: 1,
			verses: ['Matthew verse']
		}
	]
} satisfies TranslationPackage;

describe('buildBibleNavigation', () => {
	it('groups declared books by testament and lists existing chapters', () => {
		expect(buildBibleNavigation(translationPackage)).toEqual([
			{
				id: 'old',
				name: 'Old Testament',
				books: [
					{
						id: 'genesis',
						name: 'Genesis',
						chapters: [1, 2]
					},
					{
						id: 'tobit',
						name: 'Tobit',
						chapters: [1]
					}
				]
			},
			{
				id: 'new',
				name: 'New Testament',
				books: [
					{
						id: 'matthew',
						name: 'Matthew',
						chapters: [1]
					},
					{
						id: 'john',
						name: 'John',
						chapters: [3]
					}
				]
			}
		]);
	});

	it('returns an empty navigation for an unsupported canon', () => {
		const unsupportedPackage: TranslationPackage = {
			...translationPackage,
			manifest: {
				...translationPackage.manifest,
				canonId: 'future-canon'
			}
		};

		expect(buildBibleNavigation(unsupportedPackage)).toEqual([]);
	});

	it('builds navigation names for the selected locale', () => {
		expect(buildBibleNavigation(translationPackage, 'pl')).toEqual([
			{
				id: 'old',
				name: 'Stary Testament',
				books: [
					{
						id: 'genesis',
						name: 'Księga Rodzaju',
						chapters: [1, 2]
					},
					{
						id: 'tobit',
						name: 'Księga Tobiasza',
						chapters: [1]
					}
				]
			},
			{
				id: 'new',
				name: 'Nowy Testament',
				books: [
					{
						id: 'matthew',
						name: 'Ewangelia Mateusza',
						chapters: [1]
					},
					{
						id: 'john',
						name: 'Ewangelia Jana',
						chapters: [3]
					}
				]
			}
		]);
	});
});
