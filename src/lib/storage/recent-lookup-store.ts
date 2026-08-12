import type { RecentLookup } from '../domain/recent-lookup';

export interface RecentLookupStore {
	getRecentLookups(): Promise<RecentLookup[]>;

	replaceRecentLookups(lookups: readonly RecentLookup[]): Promise<void>;
}
