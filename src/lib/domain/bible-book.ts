export type BibleBook = {
	id: string;
	names: string[];
	abbreviations: string[];
};

function defineBook(id: string, name: string, ...abbreviations: string[]): BibleBook {
	return {
		id,
		names: [name],
		abbreviations
	};
}

export const johnBook = defineBook('john', 'John', 'Jn', 'J');

/**
 * Book identities and searchable aliases shared by every canon.
 *
 * Consumers must use a BibleCanon when canonical membership or display order
 * matters. The first name is the current English display name; abbreviations
 * may come from multiple languages. The order of this catalog is not part of
 * its public contract.
 */
export const bibleBooks: BibleBook[] = [
	defineBook('genesis', 'Genesis', 'Gen', 'Rdz'),
	defineBook('exodus', 'Exodus', 'Exod', 'Wj'),
	defineBook('leviticus', 'Leviticus', 'Lev', 'Kpł'),
	defineBook('numbers', 'Numbers', 'Num', 'Lb'),
	defineBook('deuteronomy', 'Deuteronomy', 'Deut', 'Pwt'),
	defineBook('joshua', 'Joshua', 'Josh', 'Joz'),
	defineBook('judges', 'Judges', 'Judg', 'Sdz'),
	defineBook('ruth', 'Ruth', 'Ru', 'Rt'),
	defineBook('1-samuel', '1 Samuel', '1 Sam', '1 Sm'),
	defineBook('2-samuel', '2 Samuel', '2 Sam', '2 Sm'),
	defineBook('1-kings', '1 Kings', '1 Kgs', '1 Krl'),
	defineBook('2-kings', '2 Kings', '2 Kgs', '2 Krl'),
	defineBook('1-chronicles', '1 Chronicles', '1 Chr', '1 Krn'),
	defineBook('2-chronicles', '2 Chronicles', '2 Chr', '2 Krn'),
	defineBook('ezra', 'Ezra', 'Ezr', 'Ezd'),
	defineBook('nehemiah', 'Nehemiah', 'Neh', 'Ne'),
	defineBook('tobit', 'Tobit', 'Tob', 'Tb'),
	defineBook('judith', 'Judith', 'Jdt'),
	defineBook('esther', 'Esther', 'Esth', 'Est'),
	defineBook('1-maccabees', '1 Maccabees', '1 Macc', '1 Mch'),
	defineBook('2-maccabees', '2 Maccabees', '2 Macc', '2 Mch'),
	defineBook('job', 'Job', 'Jb', 'Hi'),
	defineBook('psalms', 'Psalms', 'Psalm', 'Ps'),
	defineBook('proverbs', 'Proverbs', 'Prov', 'Prz'),
	defineBook('ecclesiastes', 'Ecclesiastes', 'Eccl', 'Koh'),
	defineBook('song-of-songs', 'Song of Songs', 'Song', 'Sng', 'Pnp'),
	defineBook('wisdom', 'Wisdom', 'Wis', 'Mdr'),
	defineBook('sirach', 'Sirach', 'Sir', 'Syr'),
	defineBook('isaiah', 'Isaiah', 'Isa', 'Iz'),
	defineBook('jeremiah', 'Jeremiah', 'Jer', 'Jr'),
	defineBook('lamentations', 'Lamentations', 'Lam', 'Lm'),
	defineBook('baruch', 'Baruch', 'Bar', 'Ba'),
	defineBook('ezekiel', 'Ezekiel', 'Ezek', 'Ez'),
	defineBook('daniel', 'Daniel', 'Dan', 'Dn'),
	defineBook('hosea', 'Hosea', 'Hos', 'Oz'),
	defineBook('joel', 'Joel', 'Jl'),
	defineBook('amos', 'Amos', 'Am'),
	defineBook('obadiah', 'Obadiah', 'Obad', 'Ab'),
	defineBook('jonah', 'Jonah', 'Jon'),
	defineBook('micah', 'Micah', 'Mic', 'Mi'),
	defineBook('nahum', 'Nahum', 'Nah', 'Na'),
	defineBook('habakkuk', 'Habakkuk', 'Hab', 'Ha'),
	defineBook('zephaniah', 'Zephaniah', 'Zeph', 'So'),
	defineBook('haggai', 'Haggai', 'Hag', 'Ag'),
	defineBook('zechariah', 'Zechariah', 'Zech', 'Za'),
	defineBook('malachi', 'Malachi', 'Mal', 'Ml'),
	defineBook('matthew', 'Matthew', 'Matt', 'Mt'),
	defineBook('mark', 'Mark', 'Mk'),
	defineBook('luke', 'Luke', 'Lk', 'Łk'),
	defineBook('john', 'John', 'Jn', 'J'),
	defineBook('acts', 'Acts', 'Ac', 'Dz'),
	defineBook('romans', 'Romans', 'Rom', 'Rz'),
	defineBook('1-corinthians', '1 Corinthians', '1 Cor', '1 Kor'),
	defineBook('2-corinthians', '2 Corinthians', '2 Cor', '2 Kor'),
	defineBook('galatians', 'Galatians', 'Gal', 'Ga'),
	defineBook('ephesians', 'Ephesians', 'Eph', 'Ef'),
	defineBook('philippians', 'Philippians', 'Phil', 'Flp'),
	defineBook('colossians', 'Colossians', 'Col', 'Kol'),
	defineBook('1-thessalonians', '1 Thessalonians', '1 Thess', '1 Tes'),
	defineBook('2-thessalonians', '2 Thessalonians', '2 Thess', '2 Tes'),
	defineBook('1-timothy', '1 Timothy', '1 Tim', '1 Tm'),
	defineBook('2-timothy', '2 Timothy', '2 Tim', '2 Tm'),
	defineBook('titus', 'Titus', 'Tit', 'Tt'),
	defineBook('philemon', 'Philemon', 'Phlm', 'Flm'),
	defineBook('hebrews', 'Hebrews', 'Heb', 'Hbr'),
	defineBook('james', 'James', 'Jas', 'Jk'),
	defineBook('1-peter', '1 Peter', '1 Pet', '1 P'),
	defineBook('2-peter', '2 Peter', '2 Pet', '2 P'),
	defineBook('1-john', '1 John', '1 Jn', '1 J'),
	defineBook('2-john', '2 John', '2 Jn', '2 J'),
	defineBook('3-john', '3 John', '3 Jn', '3 J'),
	defineBook('jude', 'Jude', 'Jud'),
	defineBook('revelation', 'Revelation', 'Rev', 'Ap')
];
