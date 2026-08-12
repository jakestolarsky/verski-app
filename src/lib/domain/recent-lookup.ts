import type { BibleReference } from './bible-reference';

export type RecentLookup = {
	translationId: string;
	reference: BibleReference;
	searchedAt: number;
};
