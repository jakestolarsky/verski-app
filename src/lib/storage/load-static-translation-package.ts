import type { TranslationPackage } from '../domain/translation-package';
import { translationPackageSchema } from '../domain/validation/translation-package-schema';

export type StaticTranslationFetcher = (url: string) => Promise<{
	ok: boolean;
	status: number;
	json(): Promise<unknown>;
}>;

export async function loadStaticTranslationPackage(
	fetcher: StaticTranslationFetcher,
	url: string
): Promise<TranslationPackage> {
	const response = await fetcher(url);

	if (!response.ok) {
		throw new Error(`Failed to load translation package from ${url}: HTTP ${response.status}`);
	}

	const data = await response.json();

	return translationPackageSchema.parse(data);
}
