import type { BibleBook } from '../bible-book';
import { normalizeBookAlias } from './normalize-book-alias';

export function matchBookAlias(alias: string, books: BibleBook[]): BibleBook[] {
	const normalizedAlias = normalizeBookAlias(alias);

	return books.filter((book) => {
		const aliases = [...book.names, ...book.abbreviations];

		return aliases.some((candidate) => normalizeBookAlias(candidate) === normalizedAlias);
	});
}
