import type { RecentLookup } from '../../domain/recent-lookup';
import type { RecentLookupStore } from '../recent-lookup-store';
import { RECENT_LOOKUP_STORE_NAME } from './open-bible-database';

const RECENT_LOOKUPS_RECORD_ID = 'current';

type RecentLookupsRecord = {
	id: typeof RECENT_LOOKUPS_RECORD_ID;
	lookups: RecentLookup[];
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

export class IndexedDbRecentLookupStore implements RecentLookupStore {
	constructor(private readonly database: IDBDatabase) {}

	getRecentLookups(): Promise<RecentLookup[]> {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(RECENT_LOOKUP_STORE_NAME, 'readonly');
			const store = transaction.objectStore(RECENT_LOOKUP_STORE_NAME);
			const request = store.get(RECENT_LOOKUPS_RECORD_ID);

			request.onsuccess = () => {
				const record = request.result as RecentLookupsRecord | undefined;

				resolve(record?.lookups ?? []);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Failed to read recent lookups'));
			};
		});
	}

	async replaceRecentLookups(lookups: readonly RecentLookup[]): Promise<void> {
		const transaction = this.database.transaction(RECENT_LOOKUP_STORE_NAME, 'readwrite');
		const completion = waitForTransaction(transaction);
		const store = transaction.objectStore(RECENT_LOOKUP_STORE_NAME);

		const record: RecentLookupsRecord = {
			id: RECENT_LOOKUPS_RECORD_ID,
			lookups: [...lookups]
		};

		store.put(record);

		await completion;
	}
}
