export const TRANSLATION_CACHE_NAME = 'verski-translations';

export async function removeCachedTranslationPackage(packageUrl: string): Promise<void> {
	if (typeof caches === 'undefined') {
		return;
	}

	const cache = await caches.open(TRANSLATION_CACHE_NAME);
	const absolutePackageUrl = new URL(packageUrl, globalThis.location.origin);

	await cache.delete(absolutePackageUrl);
}
