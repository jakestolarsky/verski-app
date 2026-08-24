import { describe, expect, it } from 'vitest';
import type { TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';
import { ensureTranslationInstalled } from './ensure-translation-installed';

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
			verses: ['First verse.']
		}
	]
} satisfies TranslationPackage;

describe('ensureTranslationInstalled', () => {
	it('installs a translation that is not present', async () => {
		let installedPackage: TranslationPackage | null = null;

		const store: TranslationStore = {
			async getTranslationManifest() {
				return null;
			},

			async installTranslation(packageToInstall) {
				installedPackage = packageToInstall;
			},

			async removeTranslation() {},

			async getChapter() {
				return null;
			},

			async getInstalledChapterCount() {
				return 0;
			}
		};

		const result = await ensureTranslationInstalled(store, translationPackage);

		expect(result).toBe('installed');
		expect(installedPackage).toEqual(translationPackage);
	});

	it('does not reinstall the current translation package', async () => {
		let installCalls = 0;

		const store: TranslationStore = {
			async getTranslationManifest() {
				return translationPackage.manifest;
			},

			async removeTranslation() {},

			async installTranslation() {
				installCalls += 1;
			},

			async getChapter() {
				return null;
			},

			async getInstalledChapterCount() {
				return translationPackage.chapters.length;
			}
		};

		const result = await ensureTranslationInstalled(store, translationPackage);

		expect(result).toBe('already-installed');
		expect(installCalls).toBe(0);
	});

	it('reinstalls an outdated translation package', async () => {
		let installedPackage: TranslationPackage | null = null;

		const store: TranslationStore = {
			async getTranslationManifest() {
				return {
					...translationPackage.manifest,
					version: 'older-version'
				};
			},

			async installTranslation(packageToInstall) {
				installedPackage = packageToInstall;
			},

			async removeTranslation() {},

			async getChapter() {
				return null;
			},

			async getInstalledChapterCount() {
				return translationPackage.chapters.length;
			}
		};

		const result = await ensureTranslationInstalled(store, translationPackage);

		expect(result).toBe('installed');
		expect(installedPackage).toEqual(translationPackage);
	});

	it('reinstalls the current translation when stored chapters are incomplete', async () => {
		let installCalls = 0;

		const store: TranslationStore = {
			async getTranslationManifest() {
				return translationPackage.manifest;
			},

			async getInstalledChapterCount() {
				return 0;
			},

			async installTranslation(packageToInstall) {
				expect(packageToInstall).toEqual(translationPackage);
				installCalls += 1;
			},

			async removeTranslation() {},

			async getChapter() {
				return null;
			}
		};

		const result = await ensureTranslationInstalled(store, translationPackage);

		expect(result).toBe('installed');
		expect(installCalls).toBe(1);
	});

	it('reinstalls a translation when its attribution changes', async () => {
		let installedPackage: TranslationPackage | null = null;

		const store: TranslationStore = {
			async getTranslationManifest() {
				return {
					...translationPackage.manifest,
					attribution: 'Outdated attribution'
				};
			},

			async getInstalledChapterCount() {
				return translationPackage.chapters.length;
			},

			async installTranslation(packageToInstall) {
				installedPackage = packageToInstall;
			},

			async removeTranslation() {},

			async getChapter() {
				return null;
			}
		};

		const result = await ensureTranslationInstalled(store, translationPackage);

		expect(result).toBe('installed');
		expect(installedPackage).toEqual(translationPackage);
	});
});
