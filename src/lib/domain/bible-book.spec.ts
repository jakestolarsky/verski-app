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

	it('does not assign the same alias to different books', () => {
		const aliasOwners = new Map<string, string>();
		const collisions: string[] = [];

		for (const book of bibleBooks) {
			for (const alias of [...book.names, ...book.abbreviations]) {
				const normalizedAlias = alias.toLowerCase();
				const currentOwner = aliasOwners.get(normalizedAlias);

				if (currentOwner && currentOwner !== book.id) {
					collisions.push(`${alias}: ${currentOwner}, ${book.id}`);
				} else {
					aliasOwners.set(normalizedAlias, book.id);
				}
			}
		}

		expect(collisions).toEqual([]);
	});
});
