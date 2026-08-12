import type { RecentLookup } from '../domain/recent-lookup';
import type { RecentLookupStore } from '../storage/recent-lookup-store';
import { addRecentLookup } from './add-recent-lookup';

export async function recordRecentLookup(
	store: RecentLookupStore,
	lookup: RecentLookup
): Promise<RecentLookup[]> {
	const currentLookups = await store.getRecentLookups();
	const updatedLookups = addRecentLookup(currentLookups, lookup);

	await store.replaceRecentLookups(updatedLookups);

	return updatedLookups;
}
