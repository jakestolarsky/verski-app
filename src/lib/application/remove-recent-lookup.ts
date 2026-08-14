import type { RecentLookup } from '$lib/domain/recent-lookup';
import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';
import { representsSameLookup } from './add-recent-lookup';

export function withoutRecentLookup(
	currentLookups: readonly RecentLookup[],
	lookupToRemove: RecentLookup
): RecentLookup[] {
	return currentLookups.filter((lookup) => !representsSameLookup(lookup, lookupToRemove));
}

export async function removeRecentLookup(
	store: RecentLookupStore,
	lookupToRemove: RecentLookup
): Promise<RecentLookup[]> {
	const currentLookups = await store.getRecentLookups();
	const updatedLookups = withoutRecentLookup(currentLookups, lookupToRemove);

	await store.replaceRecentLookups(updatedLookups);

	return updatedLookups;
}
