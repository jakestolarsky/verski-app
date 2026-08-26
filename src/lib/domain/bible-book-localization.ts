import { bibleBookIds, isBibleBookId, type BibleBookId } from './bible-book';
import { availableLocales, type AppLocale } from './user-settings';
import { englishBibleBooks } from './bible-book-locales/en';
import { polishBibleBooks } from './bible-book-locales/pl';

export type BibleBookLocalizationCatalog = Record<
	BibleBookId,
	readonly [displayName: string, ...aliases: string[]]
>;

export type BibleBookAliasesProvider = (bookId: BibleBookId) => readonly string[];

export const bibleBookLocalizationCatalogs: Record<AppLocale, BibleBookLocalizationCatalog> = {
	en: englishBibleBooks,
	pl: polishBibleBooks
};

export function getBibleBookName(bookId: string, locale: AppLocale): string {
	if (!isBibleBookId(bookId)) {
		return bookId;
	}

	return bibleBookLocalizationCatalogs[locale][bookId][0];
}

export function getBibleBookAliases(bookId: BibleBookId): readonly string[] {
	const aliases = availableLocales.flatMap((locale) => {
		const [displayName, ...localizedAliases] = bibleBookLocalizationCatalogs[locale][bookId];

		return [displayName, ...localizedAliases];
	});

	return [...new Set(aliases)];
}

export function hasCompleteBibleBookLocalization(locale: AppLocale): boolean {
	const localizedBookIds = Object.keys(bibleBookLocalizationCatalogs[locale]);

	return bibleBookIds.every((bookId) => localizedBookIds.includes(bookId));
}
