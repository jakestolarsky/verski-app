import type { TranslationCatalogEntry } from '../domain/translation-catalog';
import type { TranslationStore } from '../storage/translation-store';

export type RemoveInstalledTranslationResult =
	'removed' | 'default-translation' | 'active-translation';

type TranslationRemovalStore = Pick<TranslationStore, 'removeTranslation'>;

type RemoveCachedPackage = (packageUrl: string) => Promise<void>;

export async function removeInstalledTranslation(
	store: TranslationRemovalStore,
	translation: TranslationCatalogEntry,
	activeTranslationId: string,
	defaultTranslationId: string,
	removeCachedPackage: RemoveCachedPackage
): Promise<RemoveInstalledTranslationResult> {
	const translationId = translation.manifest.id;

	if (translationId === defaultTranslationId) {
		return 'default-translation';
	}

	if (translationId === activeTranslationId) {
		return 'active-translation';
	}

	await store.removeTranslation(translationId);
	await removeCachedPackage(translation.packageUrl);

	return 'removed';
}
