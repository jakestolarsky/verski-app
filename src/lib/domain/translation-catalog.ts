import type { TranslationManifest } from './translation-package';

export const BUNDLED_DEFAULT_TRANSLATION_ID = 'engwebp';

export type TranslationCatalogEntry = {
	manifest: TranslationManifest;
	packageUrl: string;
};

export type TranslationCatalog = {
	defaultTranslationId: string;
	translations: TranslationCatalogEntry[];
};
