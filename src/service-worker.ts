/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;

const APP_CACHE_PREFIX = 'verski-app-';
const APP_CACHE = `${APP_CACHE_PREFIX}${version}`;
const TRANSLATION_CACHE = 'verski-translations';

const translationUrl = `${base}/translations/engwebp-john.json`;

const appAssets = [
	...new Set([
		`${base}/`,
		...build,
		...prerendered,
		...files.filter((file) => file !== translationUrl)
	])
];

worker.addEventListener('install', (event) => {
	event.waitUntil(
		Promise.all([
			caches.open(APP_CACHE).then((cache) => cache.addAll(appAssets)),
			caches.open(TRANSLATION_CACHE).then((cache) => cache.add(translationUrl))
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

	if (url.pathname === translationUrl) {
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
