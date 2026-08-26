import type { BibleBook } from '../bible-book';
import { getBibleBookAliases, type BibleBookAliasesProvider } from '../bible-book-localization';
import { normalizeBookAlias } from './normalize-book-alias';

export function matchBookAlias(
	alias: string,
	books: readonly BibleBook[],
	getAliases: BibleBookAliasesProvider = getBibleBookAliases
): BibleBook[] {
	const normalizedAlias = normalizeBookAlias(alias);

	return books.filter((book) =>
		getAliases(book.id).some((candidate) => normalizeBookAlias(candidate) === normalizedAlias)
	);
}
