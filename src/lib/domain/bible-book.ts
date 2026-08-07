export type BibleBook = {
	id: string;
	order: number;
	chapterCount: number;
	names: string[];
	abbreviations: string[];
};

export const johnBook: BibleBook = {
	id: 'john',
	order: 43,
	chapterCount: 21,
	names: ['John'],
	abbreviations: ['Jn', 'J']
};
