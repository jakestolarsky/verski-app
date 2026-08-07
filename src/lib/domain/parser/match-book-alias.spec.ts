import { describe, expect, it } from 'vitest';
import { johnBook } from '../bible-book';
import { matchBookAlias } from './match-book-alias';

const books = [johnBook];

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
});
