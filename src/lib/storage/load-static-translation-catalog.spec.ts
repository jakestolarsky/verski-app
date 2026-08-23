import { describe, expect, it } from 'vitest';

import type { TranslationCatalog } from '../domain/translation-catalog';
import { loadStaticTranslationCatalog } from './load-static-translation-catalog';

const validCatalog = {
	defaultTranslationId: 'engwebp',
	translations: [
		{
			manifest: {
				id: 'engwebp',
				name: 'World English Bible',
				language: 'en-US',
				version: '2026-08-10',
				attribution: 'World English Bible — Public Domain',
				license: 'Public Domain',
				licenseUrl: 'https://ebible.org/legal.php',
				source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
				sourceChecksum: `sha256:${'a'.repeat(64)}`,
				schemaVersion: 1,
				canonId: 'protestant-66',
				bookIds: ['john']
			},
			packageUrl: '/translations/engwebp.json'
		}
	]
} satisfies TranslationCatalog;

describe('loadStaticTranslationCatalog', () => {
	it('loads a valid translation catalog', async () => {
		const fetcher = async () => ({
			ok: true,
			status: 200,
			async json() {
				return validCatalog;
			}
		});

		const result = await loadStaticTranslationCatalog(fetcher, '/translations/catalog.json');

		expect(result).toEqual(validCatalog);
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
			loadStaticTranslationCatalog(fetcher, '/translations/missing.json')
		).rejects.toThrowError(
			'Failed to load translation catalog from /translations/missing.json: HTTP 404'
		);
	});

	it('rejects a catalog that does not match the schema', async () => {
		const fetcher = async () => ({
			ok: true,
			status: 200,
			async json() {
				return {
					...validCatalog,
					translations: []
				};
			}
		});

		await expect(
			loadStaticTranslationCatalog(fetcher, '/translations/catalog.json')
		).rejects.toThrow();
	});
});
