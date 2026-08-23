import { describe, expect, it } from 'vitest';

import type { TranslationCatalog } from '$lib/domain/translation-catalog';
import type { TranslationPackage } from '$lib/domain/translation-package';
import { load } from './+page';

const translationPackage = {
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
	chapters: [
		{
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: ['First verse.']
		}
	]
} satisfies TranslationPackage;

const translationCatalog = {
	defaultTranslationId: 'engwebp',
	translations: [
		{
			manifest: translationPackage.manifest,
			packageUrl: '/translations/engwebp.json'
		},
		{
			manifest: {
				...translationPackage.manifest,
				id: 'polubg',
				name: 'Uwspółcześniona Biblia Gdańska',
				language: 'pl-PL'
			},
			packageUrl: '/translations/polubg.json'
		}
	]
} satisfies TranslationCatalog;

describe('+page load', () => {
	it('loads the catalog and only its default translation package', async () => {
		const requestedUrls: string[] = [];

		const fetcher = async (input: RequestInfo | URL): Promise<Response> => {
			const url = input.toString();

			requestedUrls.push(url);

			if (url === '/translations/catalog.json') {
				return Response.json(translationCatalog);
			}

			if (url === '/translations/engwebp.json') {
				return Response.json(translationPackage);
			}

			return new Response(null, { status: 404 });
		};

		const result = await load({
			fetch: fetcher
		} as Parameters<typeof load>[0]);

		expect(requestedUrls).toEqual(['/translations/catalog.json', '/translations/engwebp.json']);

		expect(result).toEqual({
			translationCatalog,
			translationPackage
		});
	});
});
