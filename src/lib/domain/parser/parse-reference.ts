import { johnBook } from '../bible-book';
import type { BibleReference } from '../bible-reference';
import { normalizeReferenceInput } from './normalize-reference-input';
import { matchBookAlias } from './match-book-alias';
import {
    validateReference,
    type ReferenceValidationError
} from '../validation/validate-reference';


export type ParseReferenceError =
	| 'invalid-format'
	| ReferenceValidationError;

export type ParseReferenceResult =
    | {
        ok: true;
        reference: BibleReference;
    }
    | {
        ok: false;
        error: ParseReferenceError;
    };

const strictReferencePattern = /^(\S+) (\d+)(?::(\d+)(?:-(\d+))?)?$/;

const supportedBooks = [johnBook];

export function parseReference(input: string): ParseReferenceResult {
    const normalizedInput = normalizeReferenceInput(input);
    const match = strictReferencePattern.exec(normalizedInput);

    if (!match) {
        return {
            ok: false,
            error: 'invalid-format'
        };
    }

    const [, bookName, chapterText, verseStartText, verseEndText] = match;

    const bookMatches = matchBookAlias(bookName, supportedBooks);

    if (bookMatches.length !== 1) {
        return {
            ok: false,
            error: 'invalid-format'
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

    return validateReference(reference, supportedBooks);
}