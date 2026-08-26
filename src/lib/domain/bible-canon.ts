export type BibleTestamentId = 'old' | 'new';

export type BibleTestament = {
	id: BibleTestamentId;
	bookIds: string[];
};

export type BibleCanon = {
	id: string;

	/**
	 * Testament groups in their display order.
	 */
	testaments: BibleTestament[];

	/**
	 * Canonical book identifiers in their display order.
	 */
	bookIds: string[];
};

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

const protestantOldTestamentBookIds = [
	'genesis',
	'exodus',
	'leviticus',
	'numbers',
	'deuteronomy',
	'joshua',
	'judges',
	'ruth',
	'1-samuel',
	'2-samuel',
	'1-kings',
	'2-kings',
	'1-chronicles',
	'2-chronicles',
	'ezra',
	'nehemiah',
	'esther',
	'job',
	'psalms',
	'proverbs',
	'ecclesiastes',
	'song-of-songs',
	'isaiah',
	'jeremiah',
	'lamentations',
	'ezekiel',
	'daniel',
	'hosea',
	'joel',
	'amos',
	'obadiah',
	'jonah',
	'micah',
	'nahum',
	'habakkuk',
	'zephaniah',
	'haggai',
	'zechariah',
	'malachi'
];

const catholicOldTestamentBookIds = [
	'genesis',
	'exodus',
	'leviticus',
	'numbers',
	'deuteronomy',
	'joshua',
	'judges',
	'ruth',
	'1-samuel',
	'2-samuel',
	'1-kings',
	'2-kings',
	'1-chronicles',
	'2-chronicles',
	'ezra',
	'nehemiah',
	'tobit',
	'judith',
	'esther',
	'1-maccabees',
	'2-maccabees',
	'job',
	'psalms',
	'proverbs',
	'ecclesiastes',
	'song-of-songs',
	'wisdom',
	'sirach',
	'isaiah',
	'jeremiah',
	'lamentations',
	'baruch',
	'ezekiel',
	'daniel',
	'hosea',
	'joel',
	'amos',
	'obadiah',
	'jonah',
	'micah',
	'nahum',
	'habakkuk',
	'zephaniah',
	'haggai',
	'zechariah',
	'malachi'
];

function defineCanon(id: string, oldTestamentBookIds: string[]): BibleCanon {
	const testaments: BibleTestament[] = [
		{
			id: 'old',
			bookIds: [...oldTestamentBookIds]
		},
		{
			id: 'new',
			bookIds: [...newTestamentBookIds]
		}
	];

	return {
		id,
		testaments,
		bookIds: testaments.flatMap((testament) => testament.bookIds)
	};
}

export const protestantCanon = defineCanon('protestant-66', protestantOldTestamentBookIds);

export const catholicCanon = defineCanon('catholic-73', catholicOldTestamentBookIds);

export const bibleCanons: BibleCanon[] = [protestantCanon, catholicCanon];

export function findBibleCanon(canonId: string): BibleCanon | null {
	return bibleCanons.find((canon) => canon.id === canonId) ?? null;
}
