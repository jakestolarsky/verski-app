import type { RecentLookup } from '$lib/domain/recent-lookup';

export const MAX_RECENT_LOOKUPS = 10;

function representsSameLookup(left: RecentLookup, right: RecentLookup): boolean {
	return (
		left.translationId === right.translationId &&
		left.reference.bookId === right.reference.bookId &&
		left.reference.chapter === right.reference.chapter &&
		left.reference.verseStart === right.reference.verseStart &&
		left.reference.verseEnd === right.reference.verseEnd
	);
}

export function addRecentLookup(
	currentLookups: readonly RecentLookup[],
	newLookup: RecentLookup
): RecentLookup[] {
	const lookupsWithoutDuplicate = currentLookups.filter(
		(lookup) => !representsSameLookup(lookup, newLookup)
	);

	return [newLookup, ...lookupsWithoutDuplicate].slice(0, MAX_RECENT_LOOKUPS);
}
