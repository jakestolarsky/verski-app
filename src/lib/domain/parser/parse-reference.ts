import { johnBook } from '../bible-book';
import type { BibleReference } from '../bible-reference';
import { normalizeReferenceInput } from './normalize-reference-input';

export type ParseReferenceResult =
    | {
        ok: true;
        reference: BibleReference;
    }
    | {
        ok: false;
        error: 'invalid-format';
    };

const strictReferencePattern = /^(\S+) (\d+):(\d+)$/;

export function parseReference(input: string): ParseReferenceResult {
    const normalizedInput = normalizeReferenceInput(input);
    const match = strictReferencePattern.exec(normalizedInput);

    if (!match) {
        return {
            ok: false,
            error: 'invalid-format'
        };
    }

    const [, bookName, chapterText, verseText] = match;

    if (!johnBook.names.includes(bookName)) {
        return {
            ok: false,
            error: 'invalid-format'
        };
    }

    return {
        ok: true,
        reference: {
            bookId: johnBook.id,
            chapter: Number(chapterText),
            verseStart: Number(verseText)
        }
    };
}