import { describe, expect, it } from 'vitest';

import type { TranslationCatalogEntry } from '../domain/translation-catalog';
import type { TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';
import { prepareTranslationSelection } from './prepare-translation-selection';

const translationPackage = {
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
	chapters: [
		{
			translationId: 'polubg',
			bookId: 'john',
			chapter: 1,
			verses: ['Na początku było Słowo.']
		}
	]
} satisfies TranslationPackage;

const catalogEntry = {
	manifest: translationPackage.manifest,
	packageUrl: '/translations/polubg.json'
} satisfies TranslationCatalogEntry;

function createTranslationStore(
	onInstall: (translationPackage: TranslationPackage) => void
): TranslationStore {
	return {
		async getChapter() {
			return null;
		},

		async getTranslationManifest() {
			return null;
		},

		async getInstalledChapterCount() {
			return 0;
		},

		async installTranslation(packageToInstall) {
			onInstall(packageToInstall);
		},

        async removeTranslation() {}
	};
}

describe('prepareTranslationSelection', () => {
	it('loads the package referenced by the catalog', async () => {
		let requestedUrl: string | null = null;

		const result = await prepareTranslationSelection(
			catalogEntry,
			async (url) => {
				requestedUrl = url;
				return translationPackage;
			},
			null
		);

		expect(requestedUrl).toBe('/translations/polubg.json');
		expect(result).toEqual(translationPackage);
	});

	it('installs the loaded package when persistent storage is available', async () => {
		let installedPackage: TranslationPackage | null = null;

		const store = createTranslationStore((packageToInstall) => {
			installedPackage = packageToInstall;
		});

		const result = await prepareTranslationSelection(
			catalogEntry,
			async () => translationPackage,
			store
		);

		expect(installedPackage).toEqual(translationPackage);
		expect(result).toEqual(translationPackage);
	});

	it('rejects a package that does not match the catalog entry', async () => {
		const mismatchedPackage = {
			...translationPackage,
			manifest: {
				...translationPackage.manifest,
				version: 'unexpected-version'
			}
		} satisfies TranslationPackage;

		await expect(
			prepareTranslationSelection(catalogEntry, async () => mismatchedPackage, null)
		).rejects.toThrowError('Translation package polubg does not match its catalog entry.');
	});
});
