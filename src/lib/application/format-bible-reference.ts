import type { BibleReference } from '../domain/bible-reference';

export function formatBibleReference(reference: BibleReference, bookName: string): string {
	if (reference.verseStart === undefined) {
		return `${bookName} ${reference.chapter}`;
	}

	if (reference.verseEnd === undefined) {
		return `${bookName} ${reference.chapter}:${reference.verseStart}`;
	}

	return `${bookName} ${reference.chapter}:${reference.verseStart}-${reference.verseEnd}`;
}
