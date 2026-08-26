import { describe, expect, it } from 'vitest';
import { parseReference } from './parse-reference';
import type { BibleBook } from '../bible-book';
import type { BibleBookAliasesProvider } from '../bible-book-localization';

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

	it.each([
		{
			input: '1 Corinthians 13',
			reference: {
				bookId: '1-corinthians',
				chapter: 13
			}
		},
		{
			input: '1 Kor 13:4-7',
			reference: {
				bookId: '1-corinthians',
				chapter: 13,
				verseStart: 4,
				verseEnd: 7
			}
		},
		{
			input: '1 John 3:16',
			reference: {
				bookId: '1-john',
				chapter: 3,
				verseStart: 16
			}
		},
		{
			input: 'Song of Songs 1',
			reference: {
				bookId: 'song-of-songs',
				chapter: 1
			}
		}
	])('parses the multi-word reference $input', ({ input, reference }) => {
		expect(parseReference(input)).toEqual({
			ok: true,
			reference
		});
	});

	it.each([
		{
			input: 'John3:16',
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			}
		},
		{
			input: 'Rdz1:1',
			reference: {
				bookId: 'genesis',
				chapter: 1,
				verseStart: 1
			}
		},
		{
			input: 'Hi1:1',
			reference: {
				bookId: 'job',
				chapter: 1,
				verseStart: 1
			}
		},
		{
			input: '1Kor13:4-7',
			reference: {
				bookId: '1-corinthians',
				chapter: 13,
				verseStart: 4,
				verseEnd: 7
			}
		}
	])('parses the compact reference $input', ({ input, reference }) => {
		expect(parseReference(input)).toEqual({
			ok: true,
			reference
		});
	});

	it('reports an unknown book separately from an invalid format', () => {
		expect(parseReference('Jhn 3:16')).toEqual({
			ok: false,
			error: 'unknown-book'
		});
	});

	it('reports an ambiguous book alias', () => {
		const books: BibleBook[] = [{ id: 'john' }, { id: 'james' }];

		const ambiguousAliases: BibleBookAliasesProvider = () => ['J'];

		expect(parseReference('J 1:1', books, ambiguousAliases)).toEqual({
			ok: false,
			error: 'ambiguous-book'
		});
	});

	it.each(['1 Sm 1:1', '1Sm 1:1', '1Sm1:1'])('parses spacing variants in %s', (input) => {
		expect(parseReference(input)).toEqual({
			ok: true,
			reference: {
				bookId: '1-samuel',
				chapter: 1,
				verseStart: 1
			}
		});
	});
});

describe('language-independent book matching', () => {
	it.each([
		{
			input: 'John 3:16',
			bookId: 'john',
			chapter: 3,
			verseStart: 16
		},
		{
			input: 'Ewangelia Jana 3:16',
			bookId: 'john',
			chapter: 3,
			verseStart: 16
		},
		{
			input: 'Job 1:1',
			bookId: 'job',
			chapter: 1,
			verseStart: 1
		},
		{
			input: 'Księga Hioba 1:1',
			bookId: 'job',
			chapter: 1,
			verseStart: 1
		},
		{
			input: '1 Corinthians 13:4',
			bookId: '1-corinthians',
			chapter: 13,
			verseStart: 4
		},
		{
			input: '1 List do Koryntian 13:4',
			bookId: '1-corinthians',
			chapter: 13,
			verseStart: 4
		}
	])(
		'parses $input without depending on the UI locale',
		({ input, bookId, chapter, verseStart }) => {
			expect(parseReference(input)).toEqual({
				ok: true,
				reference: {
					bookId,
					chapter,
					verseStart
				}
			});
		}
	);
});
