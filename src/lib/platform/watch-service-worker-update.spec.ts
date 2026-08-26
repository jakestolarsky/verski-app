import { describe, expect, it, vi } from 'vitest';
import { watchForServiceWorkerUpdate } from './watch-service-worker-update';

function createWorker(state: ServiceWorkerState = 'installing') {
	return Object.assign(new EventTarget(), {
		state
	});
}

function createRegistration(
	worker: ReturnType<typeof createWorker> | null,
	waiting: ReturnType<typeof createWorker> | null = null
) {
	return Object.assign(new EventTarget(), {
		installing: worker,
		waiting
	});
}

describe('watchForServiceWorkerUpdate', () => {
	it('reports an already waiting update', async () => {
		const waitingWorker = createWorker('installed');
		const registration = createRegistration(null, waitingWorker);
		const onUpdateAvailable = vi.fn();

		const serviceWorkers = {
			controller: {},
			ready: Promise.resolve(registration)
		} as unknown as ServiceWorkerContainer;

		watchForServiceWorkerUpdate(onUpdateAvailable, serviceWorkers);

		await Promise.resolve();

		expect(onUpdateAvailable).toHaveBeenCalledOnce();
	});

	it('reports a newly installed worker when the app is already controlled', async () => {
		const worker = createWorker();
		const registration = createRegistration(worker);
		const onUpdateAvailable = vi.fn();

		const serviceWorkers = {
			controller: {},
			ready: Promise.resolve(registration)
		} as unknown as ServiceWorkerContainer;

		watchForServiceWorkerUpdate(onUpdateAvailable, serviceWorkers);

		await Promise.resolve();

		registration.dispatchEvent(new Event('updatefound'));
		worker.state = 'installed';
		worker.dispatchEvent(new Event('statechange'));

		expect(onUpdateAvailable).toHaveBeenCalledOnce();
	});

	it('does not report the first Service Worker installation as an update', async () => {
		const worker = createWorker();
		const registration = createRegistration(worker);
		const onUpdateAvailable = vi.fn();

		const serviceWorkers = {
			controller: null,
			ready: Promise.resolve(registration)
		} as unknown as ServiceWorkerContainer;

		watchForServiceWorkerUpdate(onUpdateAvailable, serviceWorkers);

		await Promise.resolve();

		registration.dispatchEvent(new Event('updatefound'));
		worker.state = 'installed';
		worker.dispatchEvent(new Event('statechange'));

		expect(onUpdateAvailable).not.toHaveBeenCalled();
	});
});
