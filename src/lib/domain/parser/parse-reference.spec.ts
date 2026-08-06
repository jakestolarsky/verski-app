import { describe, expect, it } from 'vitest';
import { parseReference } from './parse-reference';

describe('parseReference', () => {
    it('parses a strict John chapter and verse reference', () => {
        expect(parseReference('John 3:16')).toEqual({
            ok: true,
            reference: {
                bookId: 'john',
                chapter: 3,
                verseStart: 16
            }
        });
    });

    it('rejects a chapter-only reference in strict mode', () => {
        expect(parseReference('John 3')).toEqual({
            ok: true,
            reference: {
                bookId: 'john',
                chapter: 3
            }
        });
    });

    it('parses an abbreviated book name', () => {
        expect(parseReference('Jn 3:16')).toEqual({
            ok: true,
            reference: {
                bookId: 'john',
                chapter: 3,
                verseStart: 16
            }
        });
    });

    it('parses an abbreviated reference with a comma separator', () => {
        expect(parseReference('J 3,16')).toEqual({
            ok: true,
            reference: {
                bookId: 'john',
                chapter: 3,
                verseStart: 16
            }
        });
    });

    it('parses a verse range', () => {
        expect(parseReference('John 3:16-18')).toEqual({
            ok: true,
            reference: {
                bookId: 'john',
                chapter: 3,
                verseStart: 16,
                verseEnd: 18
            }
        });
    });

    it('rejects a chapter beyond the book chapter count', () => {
        expect(parseReference('John 22')).toEqual({
            ok: false,
            error: 'invalid-chapter'
        });
    });

    it('rejects a verse range that ends before it starts', () => {
        expect(parseReference('John 3:18-16')).toEqual({
            ok: false,
            error: 'invalid-verse-range'
        });
    });
});