import { bibleBooks, type BibleBook } from '../bible-book';
import type { BibleReference } from '../bible-reference';
import { normalizeReferenceInput } from './normalize-reference-input';
import { matchBookAlias } from './match-book-alias';
import { validateReference, type ReferenceValidationError } from '../validation/validate-reference';

export type ParseReferenceError = 'invalid-format' | 'ambiguous-book' | ReferenceValidationError;

export type ParseReferenceResult =
	| {
			ok: true;
			reference: BibleReference;
	  }
	| {
			ok: false;
			error: ParseReferenceError;
	  };

const passagePattern = /^(\d+)(?::(\d+)(?:-(\d+))?)?$/;

type PassageParts = {
	chapterText: string;
	verseStartText?: string;
	verseEndText?: string;
};

type ReferenceParts = PassageParts & {
	bookAlias: string;
};

function parsePassageParts(input: string): PassageParts | null {
	const match = passagePattern.exec(input);

	if (!match) {
		return null;
	}

	const [, chapterText, verseStartText, verseEndText] = match;

	return {
		chapterText,
		verseStartText,
		verseEndText
	};
}

function parseReferenceParts(input: string): ReferenceParts | null {
	const separatorIndex = input.lastIndexOf(' ');

	if (separatorIndex <= 0) {
		return null;
	}

	const bookAlias = input.slice(0, separatorIndex);
	const passageText = input.slice(separatorIndex + 1);
	const passageParts = parsePassageParts(passageText);

	if (!passageParts) {
		return null;
	}

	return {
		bookAlias,
		...passageParts
	};
}

function parseCompactReferenceParts(input: string, books: BibleBook[]): ReferenceParts | null {
	const normalizedInput = input.toLowerCase();
	const matches = new Map<string, ReferenceParts>();

	for (const book of books) {
		const aliases = [...book.names, ...book.abbreviations];

		for (const alias of aliases) {
			const compactAlias = alias.replaceAll(' ', '');
			const normalizedAlias = compactAlias.toLowerCase();

			if (!normalizedInput.startsWith(normalizedAlias)) {
				continue;
			}

			const passageText = input.slice(compactAlias.length);
			const passageParts = parsePassageParts(passageText);

			if (!passageParts) {
				continue;
			}

			matches.set(book.id, {
				bookAlias: alias,
				...passageParts
			});
		}
	}

	if (matches.size !== 1) {
		return null;
	}

	return [...matches.values()][0] ?? null;
}

export function parseReference(
	input: string,
	books: BibleBook[] = bibleBooks
): ParseReferenceResult {
	const normalizedInput = normalizeReferenceInput(input);
	const parts =
		parseReferenceParts(normalizedInput) ?? parseCompactReferenceParts(normalizedInput, books);

	if (!parts) {
		return {
			ok: false,
			error: 'invalid-format'
		};
	}

	const { bookAlias, chapterText, verseStartText, verseEndText } = parts;

	const bookMatches = matchBookAlias(bookAlias, books);

	if (bookMatches.length === 0) {
		return {
			ok: false,
			error: 'unknown-book'
		};
	}

	if (bookMatches.length > 1) {
		return {
			ok: false,
			error: 'ambiguous-book'
		};
	}
	const [book] = bookMatches;

	const reference: BibleReference = {
		bookId: book.id,
		chapter: Number(chapterText)
	};

	if (verseStartText !== undefined) {
		reference.verseStart = Number(verseStartText);
	}

	if (verseEndText !== undefined) {
		reference.verseEnd = Number(verseEndText);
	}

	return validateReference(reference, books);
}
