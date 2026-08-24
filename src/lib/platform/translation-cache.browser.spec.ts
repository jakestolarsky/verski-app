import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { removeCachedTranslationPackage, TRANSLATION_CACHE_NAME } from './translation-cache';

describe('translation cache', () => {
	beforeEach(async () => {
		await caches.delete(TRANSLATION_CACHE_NAME);
	});

	afterEach(async () => {
		await caches.delete(TRANSLATION_CACHE_NAME);
	});

	it('removes only the requested translation package', async () => {
		const cache = await caches.open(TRANSLATION_CACHE_NAME);

		const webUrl = new URL('/translations/engwebp.json', globalThis.location.origin);

		const ubgUrl = new URL('/translations/polubg.json', globalThis.location.origin);

		await cache.put(webUrl, Response.json({ id: 'engwebp' }));
		await cache.put(ubgUrl, Response.json({ id: 'polubg' }));

		await removeCachedTranslationPackage('/translations/polubg.json');

		await expect(cache.match(ubgUrl)).resolves.toBeUndefined();
		await expect(cache.match(webUrl)).resolves.toBeInstanceOf(Response);
	});
});
