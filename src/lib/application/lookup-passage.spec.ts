import { describe, expect, it } from 'vitest';
import type { ChapterRecord } from '../domain/translation-package';
import type { BibleRepository } from '../storage/bible-repository';
import { lookupPassage } from './lookup-passage';

const chapter: ChapterRecord = {
	translationId: 'engwebp',
	bookId: 'john',
	chapter: 1,
	verses: ['First verse.', 'Second verse.', 'Third verse.']
};

const repository: BibleRepository = {
	async getChapter(translationId, bookId, chapterNumber) {
		if (
			translationId === chapter.translationId &&
			bookId === chapter.bookId &&
			chapterNumber === chapter.chapter
		) {
			return chapter;
		}

		return null;
	}
};

describe('lookupPassage', () => {
	it('returns every verse for a chapter-only reference', async () => {
		const result = await lookupPassage(repository, 'engwebp', {
			bookId: 'john',
			chapter: 1
		});

		expect(result).toEqual({
			ok: true,
			passage: {
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 1,
				verses: [
					{
						number: 1,
						text: 'First verse.'
					},
					{
						number: 2,
						text: 'Second verse.'
					},
					{
						number: 3,
						text: 'Third verse.'
					}
				]
			}
		});
	});

	it('returns only the requested verse', async () => {
		const result = await lookupPassage(repository, 'engwebp', {
			bookId: 'john',
			chapter: 1,
			verseStart: 2
		});

		expect(result).toEqual({
			ok: true,
			passage: {
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 1,
				verses: [
					{
						number: 2,
						text: 'Second verse.'
					}
				]
			}
		});
	});

	it('returns the requested verse range', async () => {
		const result = await lookupPassage(repository, 'engwebp', {
			bookId: 'john',
			chapter: 1,
			verseStart: 2,
			verseEnd: 3
		});

		expect(result).toEqual({
			ok: true,
			passage: {
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 1,
				verses: [
					{
						number: 2,
						text: 'Second verse.'
					},
					{
						number: 3,
						text: 'Third verse.'
					}
				]
			}
		});
	});

	it('returns an error when the chapter does not exist', async () => {
		const result = await lookupPassage(repository, 'engwebp', {
			bookId: 'john',
			chapter: 2
		});

		expect(result).toEqual({
			ok: false,
			error: 'chapter-not-found'
		});
	});

	it('returns an error when the verse does not exist', async () => {
		const result = await lookupPassage(repository, 'engwebp', {
			bookId: 'john',
			chapter: 1,
			verseStart: 4
		});

		expect(result).toEqual({
			ok: false,
			error: 'verse-not-found'
		});
	});
});
