import { describe, expect, it } from 'vitest';

import { catholicCanon, protestantCanon } from './bible-canon';
import { bibleBooks } from './bible-book';

describe('bibleBooks', () => {
	it('declares one book for every identifier used by both canons', () => {
		const catalogBookIds = bibleBooks.map((book) => book.id);
		const expectedBookIds = new Set([...protestantCanon.bookIds, ...catholicCanon.bookIds]);

		expect(catalogBookIds).toHaveLength(73);
		expect(new Set(catalogBookIds).size).toBe(73);
		expect(new Set(catalogBookIds)).toEqual(expectedBookIds);
	});
});
