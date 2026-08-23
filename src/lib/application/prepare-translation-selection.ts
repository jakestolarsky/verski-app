import type { TranslationCatalogEntry } from '../domain/translation-catalog';
import type { TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';
import { ensureTranslationInstalled } from './ensure-translation-installed';

export type TranslationPackageLoader = (url: string) => Promise<TranslationPackage>;

export async function prepareTranslationSelection(
	catalogEntry: TranslationCatalogEntry,
	loadPackage: TranslationPackageLoader,
	store: TranslationStore | null
): Promise<TranslationPackage> {
	const translationPackage = await loadPackage(catalogEntry.packageUrl);

	const packageManifest = translationPackage.manifest;
	const catalogManifest = catalogEntry.manifest;

	const matchesCatalog =
		packageManifest.id === catalogManifest.id &&
		packageManifest.version === catalogManifest.version &&
		packageManifest.sourceChecksum === catalogManifest.sourceChecksum &&
		packageManifest.schemaVersion === catalogManifest.schemaVersion;

	if (!matchesCatalog) {
		throw new Error(`Translation package ${catalogManifest.id} does not match its catalog entry.`);
	}

	if (store !== null) {
		await ensureTranslationInstalled(store, translationPackage);
	}

	return translationPackage;
}
