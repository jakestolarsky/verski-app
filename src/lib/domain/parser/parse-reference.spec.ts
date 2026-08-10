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

	it('parses a chapter-only reference', () => {
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

	it('parses a chapter without imposing translation-specific bounds', () => {
		expect(parseReference('John 22')).toEqual({
			ok: true,
			reference: {
				bookId: 'john',
				chapter: 22
			}
		});
	});

	it('rejects a verse range that ends before it starts', () => {
		expect(parseReference('John 3:18-16')).toEqual({
			ok: false,
			error: 'invalid-verse-range'
		});
	});

	it('parses a reference to Genesis', () => {
		expect(parseReference('Genesis 1:1')).toEqual({
			ok: true,
			reference: {
				bookId: 'genesis',
				chapter: 1,
				verseStart: 1
			}
		});
	});

	it.each([
		['Rdz', 'genesis'],
		['Kpł', 'leviticus'],
		['Hi', 'job'],
		['Łk', 'luke'],
		['1Kor', '1-corinthians'],
		['Ap', 'revelation']
	])('parses the Polish abbreviation %s', (abbreviation, bookId) => {
		expect(parseReference(`${abbreviation} 1:1`)).toEqual({
			ok: true,
			reference: {
				bookId,
				chapter: 1,
				verseStart: 1
			}
		});
	});
});
