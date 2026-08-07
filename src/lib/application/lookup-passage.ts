import { number } from 'zod';
import type { BibleReference } from '../domain/bible-reference';
import type { BibleRepository } from '../storage/bible-repository';

export type PassageVerse = {
	number: number;
	text: string;
};

export type Passage = {
	translationId: string;
	bookId: string;
	chapter: number;
	verses: PassageVerse[];
};

export type LookupPassageResult =
	| {
			ok: true;
			passage: Passage;
	  }
	| {
			ok: false;
			error: 'chapter-not-found' | 'verse-not-found';
	  };

export async function lookupPassage(
	repository: BibleRepository,
	translationId: string,
	reference: BibleReference
): Promise<LookupPassageResult> {
	const chapter = await repository.getChapter(translationId, reference.bookId, reference.chapter);

	if (!chapter) {
		return {
			ok: false,
			error: 'chapter-not-found'
		};
	}

	const verseStart = reference.verseStart ?? 1;

	const verseEnd = reference.verseEnd ?? reference.verseStart ?? chapter.verses.length;

	if (
		verseStart > verseEnd ||
		verseStart > chapter.verses.length ||
		verseEnd > chapter.verses.length
	) {
		return {
			ok: false,
			error: 'verse-not-found'
		};
	}

	const verses = chapter.verses.slice(verseStart - 1, verseEnd).map((text, index) => ({
		number: verseStart + index,
		text
	}));

	return {
		ok: true,
		passage: {
			translationId,
			bookId: reference.bookId,
			chapter: reference.chapter,
			verses
		}
	};
}
