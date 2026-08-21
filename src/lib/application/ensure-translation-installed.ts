import type { TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';

export type EnsureTranslationInstalledResult = 'installed' | 'already-installed';

export async function ensureTranslationInstalled(
	store: TranslationStore,
	translationPackage: TranslationPackage
): Promise<EnsureTranslationInstalledResult> {
	const targetManifest = translationPackage.manifest;

	const installedManifest = await store.getTranslationManifest(targetManifest.id);

	const hasSameBooks =
		installedManifest !== null &&
		installedManifest.bookIds.length === targetManifest.bookIds.length &&
		installedManifest.bookIds.every((bookId, index) => bookId === targetManifest.bookIds[index]);

	const hasCurrentManifest =
		installedManifest !== null &&
		installedManifest.name === targetManifest.name &&
		installedManifest.language === targetManifest.language &&
		installedManifest.version === targetManifest.version &&
		installedManifest.attribution === targetManifest.attribution &&
		installedManifest.license === targetManifest.license &&
		installedManifest.licenseUrl === targetManifest.licenseUrl &&
		installedManifest.source === targetManifest.source &&
		installedManifest.schemaVersion === targetManifest.schemaVersion &&
		installedManifest.sourceChecksum === targetManifest.sourceChecksum &&
		installedManifest.canonId === targetManifest.canonId &&
		hasSameBooks;

	if (hasCurrentManifest) {
		const installedChapterCount = await store.getInstalledChapterCount(targetManifest.id);

		if (installedChapterCount === translationPackage.chapters.length) {
			return 'already-installed';
		}
	}

	await store.installTranslation(translationPackage);

	return 'installed';
}
