export type BibleCanon = {
	id: string;
	name: string;

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

export const protestantCanon: BibleCanon = {
	id: 'protestant-66',
	name: 'Protestant 66-book canon',
	bookIds: [...protestantOldTestamentBookIds, ...newTestamentBookIds]
};

export const catholicCanon: BibleCanon = {
	id: 'catholic-73',
	name: 'Catholic 73-book canon',
	bookIds: [...catholicOldTestamentBookIds, ...newTestamentBookIds]
};
