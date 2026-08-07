import { describe, expect, it } from 'vitest';
import type { TranslationManifest } from '../../src/lib/domain/translation-package';
import { createTranslationPackage } from './create-translation-package';

const manifest = {
	id: 'engwebp',
	name: 'World English Bible',
	language: 'en-US',
	version: '2026-08-06',
	license: 'Public Domain',
	licenseUrl: 'https://ebible.org/legal.php',
	source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
	sourceChecksum: 'sha256:4ea4c923cd292be353a3fc3fdf6aae75b385a8823dc9834129c20ff53f8caa70',
	schemaVersion: 1,
	canonId: 'protestant-66',
	bookIds: ['john']
} satisfies TranslationManifest;

describe('createTranslationPackage', () => {
	it('creates a translation package from VPL XML', () => {
		const xml = `<verseFile>
			<v b="JHN" c="1" v="1">First verse.</v>
			<v b="JHN" c="1" v="2">Second verse.</v>
		</verseFile>`;

		const result = createTranslationPackage(xml, manifest, {
			JHN: 'john'
		});

		expect(result).toEqual({
			manifest,
			chapters: [
				{
					translationId: 'engwebp',
					bookId: 'john',
					chapter: 1,
					verses: ['First verse.', 'Second verse.']
				}
			]
		});
	});

	it('rejects a book that is not declared in the manifest', () => {
		const xml = `<verseFile>
		<v b="JHN" c="1" v="1">First verse.</v>
	</verseFile>`;

		const invalidManifest = {
			...manifest,
			bookIds: ['romans']
		};

		expect(() =>
			createTranslationPackage(xml, invalidManifest, {
				JHN: 'john'
			})
		).toThrowError(/Chapter book must be declared in the manifest/);
	});
});
