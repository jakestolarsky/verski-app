import { describe, expect, it } from 'vitest';

import type { TranslationCatalogEntry } from '../domain/translation-catalog';
import { removeInstalledTranslation } from './remove-installed-translation';

const translation = {
	manifest: {
		id: 'polubg',
		name: 'Uwspółcześniona Biblia Gdańska',
		language: 'pl-PL',
		version: '2025-12-12',
		attribution: '© 2018 Fundacja Wrota Nadziei',
		license: 'CC BY-ND 4.0',
		licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
		source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
		sourceChecksum: `sha256:${'a'.repeat(64)}`,
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	packageUrl: '/translations/polubg.json'
} satisfies TranslationCatalogEntry;

describe('removeInstalledTranslation', () => {
	it('does not remove the bundled default translation', async () => {
		let removalCalls = 0;

		const result = await removeInstalledTranslation(
			{
				async removeTranslation() {
					removalCalls += 1;
				}
			},
			translation,
			'engwebp',
			'polubg',
			async () => {
				removalCalls += 1;
			}
		);

		expect(result).toBe('default-translation');
		expect(removalCalls).toBe(0);
	});

	it('does not remove the active translation', async () => {
		let removalCalls = 0;

		const result = await removeInstalledTranslation(
			{
				async removeTranslation() {
					removalCalls += 1;
				}
			},
			translation,
			'polubg',
			'engwebp',
			async () => {
				removalCalls += 1;
			}
		);

		expect(result).toBe('active-translation');
		expect(removalCalls).toBe(0);
	});

	it('removes stored data before removing the cached package', async () => {
		const operations: string[] = [];

		const result = await removeInstalledTranslation(
			{
				async removeTranslation(translationId) {
					operations.push(`store:${translationId}`);
				}
			},
			translation,
			'engwebp',
			'engwebp',
			async (packageUrl) => {
				operations.push(`cache:${packageUrl}`);
			}
		);

		expect(result).toBe('removed');

		expect(operations).toEqual(['store:polubg', 'cache:/translations/polubg.json']);
	});
});
