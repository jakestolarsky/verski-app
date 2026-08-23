import { loadStaticTranslationCatalog } from '$lib/storage/load-static-translation-catalog';
import { loadStaticTranslationPackage } from '$lib/storage/load-static-translation-package';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const translationCatalog = await loadStaticTranslationCatalog(
		fetch,
		'/translations/catalog.json'
	);

	const defaultTranslation = translationCatalog.translations.find(
		(entry) => entry.manifest.id === translationCatalog.defaultTranslationId
	);

	if (defaultTranslation === undefined) {
		throw new Error(
			`Default translation ${translationCatalog.defaultTranslationId} is missing from the catalog.`
		);
	}

	const translationPackage = await loadStaticTranslationPackage(
		fetch,
		defaultTranslation.packageUrl
	);

	return {
		translationCatalog,
		translationPackage
	};
};
