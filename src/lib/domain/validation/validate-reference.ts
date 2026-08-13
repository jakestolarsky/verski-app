import type { BibleBook } from '../bible-book';
import type { BibleReference } from '../bible-reference';
import { bibleReferenceSchema } from './bible-reference-schema';

export type ReferenceValidationError = 'invalid-structure' | 'unknown-book' | 'invalid-verse-range';

export type ReferenceValidationResult =
	| {
			ok: true;
			reference: BibleReference;
	  }
	| {
			ok: false;
			error: ReferenceValidationError;
	  };

export function validateReference(input: unknown, books: BibleBook[]): ReferenceValidationResult {
	const structuralResult = bibleReferenceSchema.safeParse(input);

	if (!structuralResult.success) {
		return {
			ok: false,
			error: 'invalid-structure'
		};
	}

	const reference = structuralResult.data;
	const book = books.find((candidate) => candidate.id === reference.bookId);

	if (!book) {
		return {
			ok: false,
			error: 'unknown-book'
		};
	}

	if (
		reference.verseStart !== undefined &&
		reference.verseEnd !== undefined &&
		reference.verseEnd < reference.verseStart
	) {
		return {
			ok: false,
			error: 'invalid-verse-range'
		};
	}

	return {
		ok: true,
		reference
	};
}
