import { describe, expect, it } from 'vitest';

import type { TranslationCatalog } from '../translation-catalog';
import type { TranslationManifest } from '../translation-package';
import { translationCatalogSchema } from './translation-catalog-schema';

const webManifest = {
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
} satisfies TranslationManifest;

const ubgManifest = {
	...webManifest,
	id: 'polubg',
	name: 'Uwspółcześniona Biblia Gdańska',
	language: 'pl-PL',
	attribution: '© 2018 Fundacja Wrota Nadziei',
	license: 'CC BY-ND 4.0',
	licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
	source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
	sourceChecksum: `sha256:${'b'.repeat(64)}`
} satisfies TranslationManifest;

const validCatalog = {
	defaultTranslationId: 'engwebp',
	translations: [
		{
			manifest: webManifest,
			packageUrl: '/translations/engwebp.json'
		},
		{
			manifest: ubgManifest,
			packageUrl: '/translations/polubg.json'
		}
	]
} satisfies TranslationCatalog;

describe('translationCatalogSchema', () => {
	it('accepts a valid catalog', () => {
		const result = translationCatalogSchema.safeParse(validCatalog);

		expect(result.success).toBe(true);
	});

	it('rejects duplicate translation identifiers', () => {
		const result = translationCatalogSchema.safeParse({
			...validCatalog,
			translations: [
				validCatalog.translations[0],
				{
					manifest: {
						...ubgManifest,
						id: 'engwebp'
					},
					packageUrl: '/translations/engwebp.json'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects a missing default translation', () => {
		const result = translationCatalogSchema.safeParse({
			...validCatalog,
			defaultTranslationId: 'missing'
		});

		expect(result.success).toBe(false);
	});

	it('rejects a package URL that does not match the translation identifier', () => {
		const result = translationCatalogSchema.safeParse({
			...validCatalog,
			translations: [
				{
					...validCatalog.translations[0],
					packageUrl: '/translations/wrong.json'
				},
				validCatalog.translations[1]
			]
		});

		expect(result.success).toBe(false);
	});
});
