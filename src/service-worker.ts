/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from '$service-worker';
import { BUNDLED_DEFAULT_TRANSLATION_ID } from './lib/domain/translation-catalog';

const worker = self as unknown as ServiceWorkerGlobalScope;

const APP_CACHE_PREFIX = 'verski-app-';
const APP_CACHE = `${APP_CACHE_PREFIX}${version}`;
const TRANSLATION_CACHE = 'verski-translations';

const TRANSLATION_PATH_PREFIX = `${base}/translations/`;
const translationCatalogUrl = `${TRANSLATION_PATH_PREFIX}catalog.json`;
const defaultTranslationUrl = `${TRANSLATION_PATH_PREFIX}${BUNDLED_DEFAULT_TRANSLATION_ID}.json`;

function isTranslationAsset(pathname: string): boolean {
	return pathname.startsWith(TRANSLATION_PATH_PREFIX) && pathname.endsWith('.json');
}

const appAssets = [
	...new Set([
		`${base}/`,
		...build,
		...prerendered,
		...files.filter((file) => !isTranslationAsset(file))
	])
];

worker.addEventListener('install', (event) => {
	event.waitUntil(
		Promise.all([
			caches.open(APP_CACHE).then((cache) => cache.addAll(appAssets)),
			caches
				.open(TRANSLATION_CACHE)
				.then((cache) => cache.addAll([translationCatalogUrl, defaultTranslationUrl]))
		])
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(Promise.all([removeOldAppCaches(), worker.clients.claim()]));
});

worker.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);

	if (request.method !== 'GET' || url.origin !== worker.location.origin) {
		return;
	}

	if (isTranslationAsset(url.pathname)) {
		event.respondWith(loadTranslation(request));
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(loadNavigation(request));
		return;
	}

	event.respondWith(loadAppAsset(request));
});

async function removeOldAppCaches() {
	const cacheNames = await caches.keys();

	await Promise.all(
		cacheNames
			.filter((cacheName) => cacheName.startsWith(APP_CACHE_PREFIX) && cacheName !== APP_CACHE)
			.map((cacheName) => caches.delete(cacheName))
	);
}

async function loadTranslation(request: Request): Promise<Response> {
	const cache = await caches.open(TRANSLATION_CACHE);

	try {
		const response = await fetch(request);

		if (response.ok) {
			await cache.put(request, response.clone());
		}

		return response;
	} catch {
		return (await cache.match(request)) ?? Response.error();
	}
}

async function loadNavigation(request: Request): Promise<Response> {
	try {
		return await fetch(request);
	} catch {
		const cache = await caches.open(APP_CACHE);

		return (await cache.match(`${base}/`)) ?? Response.error();
	}
}

async function loadAppAsset(request: Request): Promise<Response> {
	const cache = await caches.open(APP_CACHE);
	const cachedResponse = await cache.match(request);

	return cachedResponse ?? fetch(request);
}
