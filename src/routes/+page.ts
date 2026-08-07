import { loadStaticTranslationPackage } from '$lib/storage/load-static-translation-package';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const translationPackage = await loadStaticTranslationPackage(
		fetch,
		'/translations/engwebp-john.json'
	);

	return {
		translationPackage
	};
};
