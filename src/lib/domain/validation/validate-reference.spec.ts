import { describe, expect, it } from 'vitest';
import { johnBook } from '../bible-book';
import { validateReference } from './validate-reference';

const books = [johnBook];

describe('validateReference', () => {
	it('accepts a valid reference for a known book', () => {
		expect(
			validateReference(
				{
					bookId: 'john',
					chapter: 3,
					verseStart: 16
				},
				books
			)
		).toEqual({
			ok: true,
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			}
		});
	});

	it('rejects an unknown book identifier', () => {
		expect(
			validateReference(
				{
					bookId: 'romans',
					chapter: 8
				},
				books
			)
		).toEqual({
			ok: false,
			error: 'unknown-book'
		});
	});

	it('leaves translation-specific chapter bounds to passage lookup', () => {
		expect(
			validateReference(
				{
					bookId: 'john',
					chapter: 22
				},
				books
			)
		).toEqual({
			ok: true,
			reference: {
				bookId: 'john',
				chapter: 22
			}
		});
	});

	it('rejects a verse range that ends before it starts', () => {
		expect(
			validateReference(
				{
					bookId: 'john',
					chapter: 3,
					verseStart: 18,
					verseEnd: 16
				},
				books
			)
		).toEqual({
			ok: false,
			error: 'invalid-verse-range'
		});
	});
});
