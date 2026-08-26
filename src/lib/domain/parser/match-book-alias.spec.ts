import { describe, expect, it } from 'vitest';
import { bibleBooks } from '../bible-book';
import type { BibleBook } from '../bible-book';
import { matchBookAlias } from './match-book-alias';

const books = bibleBooks.filter((book) => book.id === 'john');
const johnBook: BibleBook = {
	id: 'john',
	names: ['John'],
	abbreviations: ['Jn', 'J']
}

describe('matchBookAlias', () => {
	it('matches a canonical book name', () => {
		expect(matchBookAlias('John', books)).toEqual([johnBook]);
	});

	it('matches a book abbreviation', () => {
		expect(matchBookAlias('Jn', books)).toEqual([johnBook]);
	});

	it('matches aliases without requiring exact casing', () => {
		expect(matchBookAlias('john', books)).toEqual([johnBook]);
	});

	it('returns no matches for an unknown alias', () => {
		expect(matchBookAlias('Romans', books)).toEqual([]);
	});

	it('ignores whitespace differences in numbered abbreviations', () => {
		expect(matchBookAlias('1Sm', bibleBooks).map((book) => book.id)).toEqual(['1-samuel']);

		expect(matchBookAlias('1 Sm', bibleBooks).map((book) => book.id)).toEqual(['1-samuel']);
	});
});
