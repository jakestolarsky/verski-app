import type { ChapterRecord } from '../../src/lib/domain/translation-package';

export type VplVerse = {
	sourceBookCode: string;
	chapter: number;
	verse: number;
	text: string;
};

export function parseVplVerses(xml: string): VplVerse[] {
	const verseElementPattern = /<v b="([^"]+)" c="(\d+)" v="(\d+)">([\s\S]*?)<\/v>/g;

	const verses: VplVerse[] = [];

	for (const match of xml.matchAll(verseElementPattern)) {
		const [, sourceBookCode, chapterText, verseText, text] = match;

		const parsedVerse: VplVerse = {
			sourceBookCode,
			chapter: Number(chapterText),
			verse: Number(verseText),
			text: text.trim()
		};

		const previousVerse = verses.at(-1);
		let expectedVerse = 1;

		if (
			previousVerse &&
			previousVerse.sourceBookCode === parsedVerse.sourceBookCode &&
			previousVerse.chapter === parsedVerse.chapter
		) {
			expectedVerse = previousVerse.verse + 1;
		}

		if (parsedVerse.verse !== expectedVerse) {
			throw new Error(
				`Expected ${parsedVerse.sourceBookCode} ${parsedVerse.chapter}:${expectedVerse}, but received verse ${parsedVerse.verse}`
			);
		}

		verses.push(parsedVerse);
	}

	return verses;
}

export function createChapterRecords(
	verses: VplVerse[],
	translationId: string,
	includedBookIdsBySourceCode: Readonly<Record<string, string>>
): ChapterRecord[] {
	const chapters: ChapterRecord[] = [];

	for (const verse of verses) {
		const bookId = includedBookIdsBySourceCode[verse.sourceBookCode];

		if (!bookId) {
			continue;
		}

		const currentChapter = chapters.at(-1);

		if (
			currentChapter &&
			currentChapter.bookId === bookId &&
			currentChapter.chapter === verse.chapter
		) {
			currentChapter.verses.push(verse.text);
			continue;
		}

		chapters.push({
			translationId,
			bookId,
			chapter: verse.chapter,
			verses: [verse.text]
		});
	}

	return chapters;
}
