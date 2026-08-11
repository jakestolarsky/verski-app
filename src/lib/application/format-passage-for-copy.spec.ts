import { describe, expect, it } from 'vitest';
import type { Passage } from './lookup-passage';
import { formatPassageForCopy } from './format-passage-for-copy';

describe('formatPassageForCopy', () => {
	it('formats a single verse with its reference and translation', () => {
		const passage: Passage = {
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 3,
			verses: [
				{
					number: 16,
					text: 'For God so loved the world.'
				}
			]
		};

		const result = formatPassageForCopy(passage, {
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			},
			bookName: 'John',
			translationName: 'World English Bible'
		});

		expect(result).toBe('John 3:16 (World English Bible)\n\nFor God so loved the world.');
	});

	it('formats a verse range with verse numbers', () => {
		const passage: Passage = {
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 3,
			verses: [
				{
					number: 16,
					text: 'First selected verse.'
				},
				{
					number: 17,
					text: 'Second selected verse.'
				},
				{
					number: 18,
					text: 'Third selected verse.'
				}
			]
		};

		const result = formatPassageForCopy(passage, {
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16,
				verseEnd: 18
			},
			bookName: 'John',
			translationName: 'World English Bible'
		});

		expect(result).toBe(
			[
				'John 3:16-18 (World English Bible)',
				'',
				'16 First selected verse.',
				'17 Second selected verse.',
				'18 Third selected verse.'
			].join('\n')
		);
	});

	it('rejects an empty passage', () => {
		const passage: Passage = {
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 3,
			verses: []
		};

		expect(() =>
			formatPassageForCopy(passage, {
				reference: {
					bookId: 'john',
					chapter: 3
				},
				bookName: 'John',
				translationName: 'World English Bible'
			})
		).toThrowError('Cannot format an empty passage');
	});

	it('preserves a chapter-only reference in copied text', () => {
		const passage: Passage = {
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 3,
			verses: [
				{
					number: 1,
					text: 'First verse.'
				},
				{
					number: 2,
					text: 'Second verse.'
				}
			]
		};

		const result = formatPassageForCopy(passage, {
			reference: {
				bookId: 'john',
				chapter: 3
			},
			bookName: 'John',
			translationName: 'World English Bible'
		});

		expect(result).toBe(
			['John 3 (World English Bible)', '', '1 First verse.', '2 Second verse.'].join('\n')
		);
	});
});
