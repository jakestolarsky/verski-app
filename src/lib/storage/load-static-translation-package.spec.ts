import { describe, expect, it } from 'vitest';
import type { TranslationPackage } from '../domain/translation-package';
import { loadStaticTranslationPackage } from './load-static-translation-package';

const validPackage = {
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
			verses: ['First verse.']
		}
	]
} satisfies TranslationPackage;

describe('loadStaticTranslationPackage', () => {
	it('loads a valid translation package', async () => {
		const fetcher = async () => ({
			ok: true,
			status: 200,
			async json() {
				return validPackage;
			}
		});

		const result = await loadStaticTranslationPackage(fetcher, '/translations/engwebp.json');

		expect(result).toEqual(validPackage);
	});

	it('rejects an unsuccessful HTTP response', async () => {
		const fetcher = async () => ({
			ok: false,
			status: 404,
			async json() {
				return {};
			}
		});

		await expect(
			loadStaticTranslationPackage(fetcher, '/translations/missing.json')
		).rejects.toThrowError(
			'Failed to load translation package from /translations/missing.json: HTTP 404'
		);
	});

	it('rejects a package that does not match the schema', async () => {
		const fetcher = async () => ({
			ok: true,
			status: 200,
			async json() {
				return {
					...validPackage,
					chapters: []
				};
			}
		});

		await expect(
			loadStaticTranslationPackage(fetcher, '/translations/invalid.json')
		).rejects.toThrow();
	});
});
