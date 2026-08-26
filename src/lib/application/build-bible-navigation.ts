import { bibleBooks } from '$lib/domain/bible-book';
import { findBibleCanon, type BibleTestamentId } from '$lib/domain/bible-canon';
import type { TranslationPackage } from '$lib/domain/translation-package';
import { getBibleBookName } from '$lib/domain/bible-book-localization';

export type BibleNavigationBook = {
	id: string;
	name: string;
	chapters: number[];
};

export type BibleNavigationTestament = {
	id: BibleTestamentId;
	name: string;
	books: BibleNavigationBook[];
};

const bibleBookById = new Map(bibleBooks.map((book) => [book.id, book]));

export function buildBibleNavigation(
	translationPackage: TranslationPackage
): BibleNavigationTestament[] {
	const canon = findBibleCanon(translationPackage.manifest.canonId);

	if (canon === null) {
		return [];
	}

	const declaredBookIds = new Set(translationPackage.manifest.bookIds);
	const chaptersByBookId = new Map<string, Set<number>>();

	for (const chapter of translationPackage.chapters) {
		if (!declaredBookIds.has(chapter.bookId)) {
			continue;
		}

		const chapterNumbers = chaptersByBookId.get(chapter.bookId) ?? new Set<number>();

		chapterNumbers.add(chapter.chapter);
		chaptersByBookId.set(chapter.bookId, chapterNumbers);
	}

	return canon.testaments
		.map((testament) => ({
			id: testament.id,
			name: testament.name,
			books: testament.bookIds
				.filter((bookId) => declaredBookIds.has(bookId))
				.map((bookId) => ({
					id: bookId,
					name: getBibleBookName(bookId, 'en'),
					chapters: [...(chaptersByBookId.get(bookId) ?? [])].sort(
						(first, second) => first - second
					)
				}))
		}))
		.filter((testament) => testament.books.length > 0);
}
