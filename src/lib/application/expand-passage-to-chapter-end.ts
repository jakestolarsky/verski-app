import type { BibleRepository } from '../storage/bible-repository';
import type { LookupPassageResult, Passage } from './lookup-passage';

export async function expandPassageToChapterEnd(
	repository: BibleRepository,
	passage: Passage
): Promise<LookupPassageResult> {
	const chapter = await repository.getChapter(
		passage.translationId,
		passage.bookId,
		passage.chapter
	);

	if (chapter === null) {
		return {
			ok: false,
			error: 'chapter-not-found'
		};
	}

	const firstVerse = passage.verses[0];

	if (
		firstVerse === undefined ||
		firstVerse.number < 1 ||
		firstVerse.number > chapter.verses.length
	) {
		return {
			ok: false,
			error: 'verse-not-found'
		};
	}

	const verses = chapter.verses.slice(firstVerse.number - 1).map((text, index) => ({
		number: firstVerse.number + index,
		text
	}));

	return {
		ok: true,
		hasMoreVerses: false,
		passage: {
			translationId: passage.translationId,
			bookId: passage.bookId,
			chapter: passage.chapter,
			verses
		}
	};
}
