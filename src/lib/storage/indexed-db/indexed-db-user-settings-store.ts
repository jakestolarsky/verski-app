import type { UserSettings } from '../../domain/user-settings';
import type { UserSettingsStore } from '../user-settings-store';
import { SETTINGS_STORE_NAME } from './open-bible-database';

const USER_SETTINGS_RECORD_ID = 'current';

type UserSettingsRecord = {
	id: typeof USER_SETTINGS_RECORD_ID;
	value: unknown;
};

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => {
			resolve();
		};

		transaction.onerror = () => {
			reject(transaction.error ?? new Error('IndexedDB transaction failed'));
		};

		transaction.onabort = () => {
			reject(transaction.error ?? new Error('IndexedDB transaction was aborted'));
		};
	});
}

export class IndexedDbUserSettingsStore implements UserSettingsStore {
	constructor(private readonly database: IDBDatabase) {}

	getStoredUserSettings(): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(SETTINGS_STORE_NAME, 'readonly');
			const store = transaction.objectStore(SETTINGS_STORE_NAME);
			const request = store.get(USER_SETTINGS_RECORD_ID);

			request.onsuccess = () => {
				const record = request.result as UserSettingsRecord | undefined;

				resolve(record?.value ?? null);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to read user settings'));
			};
		});
	}

	async replaceUserSettings(settings: UserSettings): Promise<void> {
		const transaction = this.database.transaction(SETTINGS_STORE_NAME, 'readwrite');
		const completion = waitForTransaction(transaction);
		const store = transaction.objectStore(SETTINGS_STORE_NAME);

		const record: UserSettingsRecord = {
			id: USER_SETTINGS_RECORD_ID,
			value: settings
		};

		store.put(record);

		await completion;
	}
}
