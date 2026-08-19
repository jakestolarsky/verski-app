import { describe, expect, it } from 'vitest';

import type { ChapterRecord } from '../domain/translation-package';
import type { BibleRepository } from '../storage/bible-repository';
import type { Passage } from './lookup-passage';
import { expandPassageToChapterEnd } from './expand-passage-to-chapter-end';

const chapter: ChapterRecord = {
	translationId: 'engwebp',
	bookId: 'john',
	chapter: 1,
	verses: ['First verse.', 'Second verse.', 'Third verse.']
};

const repository: BibleRepository = {
	async getChapter() {
		return chapter;
	}
};

describe('expandPassageToChapterEnd', () => {
	it('preserves the first displayed verse and appends the rest of the chapter', async () => {
		const passage: Passage = {
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: [
				{
					number: 2,
					text: 'Second verse.'
				}
			]
		};

		const result = await expandPassageToChapterEnd(repository, passage);

		expect(result).toEqual({
			ok: true,
			hasMoreVerses: false,
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
});
