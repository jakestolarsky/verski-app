import { describe, expect, it } from 'vitest';

import { bibleBooks } from './bible-book';
import {
	bibleBookLocalizationCatalogs,
	getBibleBookAliases,
	getBibleBookName
} from './bible-book-localization';
import { availableLocales } from './user-settings';
import { normalizeBookAlias } from './parser/normalize-book-alias';

describe('Bible book localization', () => {
	it('contains every Bible book in every supported locale', () => {
		const expectedBookIds = bibleBooks.map((book) => book.id).sort();

		for (const locale of availableLocales) {
			expect(Object.keys(bibleBookLocalizationCatalogs[locale]).sort()).toEqual(expectedBookIds);
		}
	});

	it('returns a display name for the selected locale', () => {
		expect(getBibleBookName('john', 'en')).toBe('John');
		expect(getBibleBookName('john', 'pl')).toBe('Ewangelia Jana');
		expect(getBibleBookName('missing-book', 'pl')).toBe('missing-book');
	});

	it('collects aliases from every locale', () => {
		expect(getBibleBookAliases('john')).toEqual(
			expect.arrayContaining(['John', 'Jn', 'Ewangelia Jana', 'Jana', 'J'])
		);
	});

	it('does not assign one normalized alias to different books', () => {
		const owners = new Map<string, string>();
		const collisions: string[] = [];

		for (const book of bibleBooks) {
			for (const alias of getBibleBookAliases(book.id)) {
				const normalizedAlias = normalizeBookAlias(alias);
				const owner = owners.get(normalizedAlias);

				if (owner !== undefined && owner !== book.id) {
					collisions.push(`${alias}: ${owner}, ${book.id}`);
					continue;
				}

				owners.set(normalizedAlias, book.id);
			}
		}

		expect(collisions).toEqual([]);
	});
});
