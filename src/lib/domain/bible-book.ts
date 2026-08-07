export type BibleBook = {
	id: string;
	chapterCount: number;
	names: string[];
	abbreviations: string[];
};

export const johnBook: BibleBook = {
	id: 'john',
	chapterCount: 21,
	names: ['John'],
	abbreviations: ['Jn', 'J']
};
