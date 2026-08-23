import type { TranslationCatalog } from '../domain/translation-catalog';
import { translationCatalogSchema } from '../domain/validation/translation-catalog-schema';
import type { StaticJsonFetcher } from './static-json-fetcher';

export async function loadStaticTranslationCatalog(
	fetcher: StaticJsonFetcher,
	url: string
): Promise<TranslationCatalog> {
	const response = await fetcher(url);

	if (!response.ok) {
		throw new Error(`Failed to load translation catalog from ${url}: HTTP ${response.status}`);
	}

	const data = await response.json();

	return translationCatalogSchema.parse(data);
}
