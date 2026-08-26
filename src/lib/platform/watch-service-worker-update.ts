function getBrowserServiceWorkers(): ServiceWorkerContainer | null {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
		return null;
	}

	return navigator.serviceWorker;
}

export function watchForServiceWorkerUpdate(
	onUpdateAvailable: () => void,
	serviceWorkers: ServiceWorkerContainer | null = getBrowserServiceWorkers()
): () => void {
	if (serviceWorkers === null) {
		return () => {};
	}

	let registration: ServiceWorkerRegistration | null = null;
	let observedWorker: ServiceWorker | null = null;
	let disposed = false;
	let updateReported = false;

	function reportUpdate() {
		if (disposed || updateReported) {
			return;
		}

		updateReported = true;
		onUpdateAvailable();
	}

	function handleWorkerStateChange() {
		if (observedWorker?.state === 'installed' && serviceWorkers?.controller !== null) {
			reportUpdate();
		}
	}

	function observeWorker(worker: ServiceWorker | null) {
		observedWorker?.removeEventListener('statechange', handleWorkerStateChange);
		observedWorker = worker;
		observedWorker?.addEventListener('statechange', handleWorkerStateChange);

		handleWorkerStateChange();
	}

	function handleUpdateFound() {
		observeWorker(registration?.installing ?? null);
	}

	void serviceWorkers.ready
		.then((nextRegistration) => {
			if (disposed) {
				return;
			}

			registration = nextRegistration;
			registration.addEventListener('updatefound', handleUpdateFound);

			if (registration.waiting !== null && serviceWorkers.controller !== null) {
				reportUpdate();
			}

			observeWorker(registration.installing);
		})
		.catch(() => {
			// Brak Service Workera nie powinien blokować działania aplikacji.
		});

	return () => {
		disposed = true;
		registration?.removeEventListener('updatefound', handleUpdateFound);
		observedWorker?.removeEventListener('statechange', handleWorkerStateChange);
	};
}
