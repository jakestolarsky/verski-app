import { describe, expect, it } from 'vitest';
import { createChapterRecords, parseVplVerses } from './parse-vpl';

describe('parseVplVerses', () => {
	it('parses verse elements and trims their text', () => {
		const xml = `<verseFile>
			<v b="JHN" c="1" v="1">In the beginning was the Word. </v>
			<v b="JHN" c="1" v="2">The same was in the beginning with God. </v>
		</verseFile>`;

		const result = parseVplVerses(xml);

		expect(result).toEqual([
			{
				sourceBookCode: 'JHN',
				chapter: 1,
				verse: 1,
				text: 'In the beginning was the Word.'
			},
			{
				sourceBookCode: 'JHN',
				chapter: 1,
				verse: 2,
				text: 'The same was in the beginning with God.'
			}
		]);
	});

	it('rejects a gap in verse numbering', () => {
		const xml = `<verseFile>
		<v b="JHN" c="1" v="1">First verse.</v>
		<v b="JHN" c="1" v="3">Third verse.</v>
	</verseFile>`;

		expect(() => parseVplVerses(xml)).toThrowError('Expected JHN 1:2, but received verse 3');
	});

	it('creates chapter records for selected books', () => {
		const xml = `<verseFile>
		<v b="GEN" c="1" v="1">This verse should be skipped.</v>
		<v b="JHN" c="1" v="1">First chapter, first verse.</v>
		<v b="JHN" c="1" v="2">First chapter, second verse.</v>
		<v b="JHN" c="2" v="1">Second chapter, first verse.</v>
	</verseFile>`;

		const verses = parseVplVerses(xml);

		const chapters = createChapterRecords(verses, 'engwebp', {
			JHN: 'john'
		});

		expect(chapters).toEqual([
			{
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 1,
				verses: ['First chapter, first verse.', 'First chapter, second verse.']
			},
			{
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 2,
				verses: ['Second chapter, first verse.']
			}
		]);
	});
});
