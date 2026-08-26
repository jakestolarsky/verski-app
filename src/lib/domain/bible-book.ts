export const bibleBookIds = [
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
	'malachi',
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
] as const;

export type BibleBookId = (typeof bibleBookIds)[number];

export type BibleBook = {
	id: BibleBookId;
};

export const bibleBooks: BibleBook[] = bibleBookIds.map((id) => ({ id }));

const bibleBookIdSet = new Set<string>(bibleBookIds);

export function isBibleBookId(value: string): value is BibleBookId {
	return bibleBookIdSet.has(value);
}
