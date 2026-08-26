import { describe, expect, it } from 'vitest';

import { TRANSLATION_CACHE_NAME } from './translation-cache';
import { APP_CACHE_PREFIX, getAppCacheName, getObsoleteAppCacheNames } from './app-cache';

describe('app cache', () => {
	it('creates a versioned application cache name', () => {
		expect(getAppCacheName('build-123')).toBe(`${APP_CACHE_PREFIX}build-123`);
	});

	it('removes only obsolete application caches', () => {
		const currentAppCacheName = getAppCacheName('current');

		expect(
			getObsoleteAppCacheNames(
				[getAppCacheName('old'), currentAppCacheName, TRANSLATION_CACHE_NAME, 'unrelated-cache'],
				currentAppCacheName
			)
		).toEqual([getAppCacheName('old')]);
	});
});
