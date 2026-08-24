import type { TranslationCatalogEntry } from '../domain/translation-catalog';
import type { TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';
import { ensureTranslationInstalled } from './ensure-translation-installed';

export type TranslationPackageLoader = (url: string) => Promise<TranslationPackage>;

function packageMatchesCatalog(
	translationPackage: TranslationPackage,
	catalogEntry: TranslationCatalogEntry
): boolean {
	const packageManifest = translationPackage.manifest;
	const catalogManifest = catalogEntry.manifest;

	return (
		packageManifest.id === catalogManifest.id &&
		packageManifest.version === catalogManifest.version &&
		packageManifest.sourceChecksum === catalogManifest.sourceChecksum &&
		packageManifest.schemaVersion === catalogManifest.schemaVersion
	);
}

export async function prepareTranslationSelection(
	catalogEntry: TranslationCatalogEntry,
	loadPackage: TranslationPackageLoader,
	store: TranslationStore | null
): Promise<TranslationPackage> {
	if (store !== null) {
		const installedPackage = await store.getTranslationPackage(catalogEntry.manifest.id);

		if (installedPackage !== null && packageMatchesCatalog(installedPackage, catalogEntry)) {
			return installedPackage;
		}
	}

	const translationPackage = await loadPackage(catalogEntry.packageUrl);

	if (!packageMatchesCatalog(translationPackage, catalogEntry)) {
		throw new Error(
			`Translation package ${catalogEntry.manifest.id} does not match its catalog entry.`
		);
	}

	if (store !== null) {
		await ensureTranslationInstalled(store, translationPackage);
	}

	return translationPackage;
}
