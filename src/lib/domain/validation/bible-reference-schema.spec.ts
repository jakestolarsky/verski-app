import { describe, expect, it } from 'vitest';
import { bibleReferenceSchema } from './bible-reference-schema';

describe('bibleReferenceSchema', () => {
    it('accepts a structurally valid reference', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3,
            verseStart: 16,
            verseEnd: 18
        });

        expect(result.success).toBe(true);
    });

    it('rejects an empty book identifier', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: '',
            chapter: 3
        });

        expect(result.success).toBe(false);
    });

    it('rejects chapter zero', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 0
        });

        expect(result.success).toBe(false);
    });

    it('rejects a fractional chapter number', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3.5
        });

        expect(result.success).toBe(false);
    });

    it('rejects verse zero', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3,
            verseStart: 0
        });

        expect(result.success).toBe(false);
    });

    it('rejects a fractional verse number', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3,
            verseStart: 16.5
        });

        expect(result.success).toBe(false);
    });

    it('rejects an invalid ending verse', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3,
            verseStart: 16,
            verseEnd: 0
        });

        expect(result.success).toBe(false);
    });

    it('rejects an ending verse without a starting verse', () => {
        const result = bibleReferenceSchema.safeParse({
            bookId: 'john',
            chapter: 3,
            verseEnd: 18
        });

        expect(result.success).toBe(false);
    });
});