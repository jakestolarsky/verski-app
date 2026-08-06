import type { BibleBook } from '../bible-book';

export function matchBookAlias(alias: string, books: BibleBook[]): BibleBook[] {
	const normalizedAlias = alias.toLowerCase();

	return books.filter((book) => {
		const aliases = [...book.names, ...book.abbreviations];

		return aliases.some(
			(candidate) => candidate.toLowerCase() === normalizedAlias
		);
	});
}