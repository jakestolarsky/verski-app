import { describe, expect, it } from 'vitest';

import type { BibleCanon } from './bible-canon';
import { catholicCanon, protestantCanon } from './bible-canon';

const newTestamentBookIds = [
	'matthew',
	'mark',
	'luke',
	'john',
	'acts',
	'romans',
	'1-corinthians',
	'2-corinthians',
	'galatians',
	'ephesians',
	'philippians',
	'colossians',
	'1-thessalonians',
	'2-thessalonians',
	'1-timothy',
	'2-timothy',
	'titus',
	'philemon',
	'hebrews',
	'james',
	'1-peter',
	'2-peter',
	'1-john',
	'2-john',
	'3-john',
	'jude',
	'revelation'
];

const deuterocanonicalBookIds = [
	'tobit',
	'judith',
	'1-maccabees',
	'2-maccabees',
	'wisdom',
	'sirach',
	'baruch'
];

function expectUniqueBookIds(canon: BibleCanon, expectedCount: number) {
	expect(canon.bookIds).toHaveLength(expectedCount);
	expect(new Set(canon.bookIds).size).toBe(expectedCount);
}

describe('Bible canons', () => {
	it('declares the 66-book Protestant canon', () => {
		expect(protestantCanon.id).toBe('protestant-66');
		expectUniqueBookIds(protestantCanon, 66);

		expect(protestantCanon.bookIds.slice(0, 5)).toEqual([
			'genesis',
			'exodus',
			'leviticus',
			'numbers',
			'deuteronomy'
		]);

		expect(protestantCanon.bookIds.slice(-27)).toEqual(newTestamentBookIds);
	});

	it('declares the 73-book Catholic canon', () => {
		expect(catholicCanon.id).toBe('catholic-73');
		expectUniqueBookIds(catholicCanon, 73);

		const deuterocanonicalBookIdSet = new Set(deuterocanonicalBookIds);

		expect(catholicCanon.bookIds.filter((bookId) => deuterocanonicalBookIdSet.has(bookId))).toEqual(
			deuterocanonicalBookIds
		);

		expect(catholicCanon.bookIds.slice(-27)).toEqual(newTestamentBookIds);
	});

	it('uses the same New Testament order in both canons', () => {
		expect(catholicCanon.bookIds.slice(-27)).toEqual(protestantCanon.bookIds.slice(-27));
	});

	it('exposes Old and New Testament groups in canonical order', () => {
		for (const canon of [protestantCanon, catholicCanon]) {
			expect(canon.testaments.map((testament) => testament.id)).toEqual(['old', 'new']);

			expect(canon.testaments.flatMap((testament) => testament.bookIds)).toEqual(canon.bookIds);
		}
	});
});
