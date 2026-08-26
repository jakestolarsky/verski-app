export const APP_CACHE_PREFIX = 'verski-app-';

export function getAppCacheName(version: string): string {
	return `${APP_CACHE_PREFIX}${version}`;
}

export function getObsoleteAppCacheNames(
	cacheNames: readonly string[],
	currentAppCacheName: string
): string[] {
	return cacheNames.filter(
		(cacheName) => cacheName.startsWith(APP_CACHE_PREFIX) && cacheName !== currentAppCacheName
	);
}
