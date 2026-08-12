import type { RecentLookupStore } from '../storage/recent-lookup-store';

export async function clearRecentLookups(store: RecentLookupStore): Promise<void> {
	await store.replaceRecentLookups([]);
}
