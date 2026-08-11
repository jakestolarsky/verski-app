import { describe, expect, it } from 'vitest';

import { formatBibleReference } from './format-bible-reference';

describe('formatBibleReference', () => {
	it('formats a chapter reference', () => {
		expect(
			formatBibleReference(
				{
					bookId: 'john',
					chapter: 3
				},
				'John'
			)
		).toBe('John 3');
	});

	it('formats a single verse reference', () => {
		expect(
			formatBibleReference(
				{
					bookId: 'john',
					chapter: 3,
					verseStart: 16
				},
				'John'
			)
		).toBe('John 3:16');
	});

	it('formats a verse range', () => {
		expect(
			formatBibleReference(
				{
					bookId: 'john',
					chapter: 3,
					verseStart: 16,
					verseEnd: 18
				},
				'John'
			)
		).toBe('John 3:16-18');
	});
});
