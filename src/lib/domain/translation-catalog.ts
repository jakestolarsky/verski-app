import type { TranslationManifest } from './translation-package';

export type TranslationCatalogEntry = {
	manifest: TranslationManifest;
	packageUrl: string;
};

export type TranslationCatalog = {
	defaultTranslationId: string;
	translations: TranslationCatalogEntry[];
};
