import { describe, expect, it } from 'vitest';
import { normalizeReferenceInput } from './normalize-reference-input';

describe('normalizeReferenceInput', () => {
    it('removes whitespace surrounding the reference', () => {
        expect(normalizeReferenceInput(' John 3:16 ')).toBe('John 3:16')
    });

    it('collapses repeated internal whitespace', () => {
        expect(normalizeReferenceInput('John   3:16')).toBe('John 3:16');
    });

    it('returns an empty string for whitespace-only input', () => {
        expect(normalizeReferenceInput('   ')).toBe('');
    });

    it('normalizes a comma verse separator to a colon', () => {
        expect(normalizeReferenceInput('John 3,16')).toBe('John 3:16');
    });
});