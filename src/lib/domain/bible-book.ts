export type BibleBook = {
	id: string;
	names: string[];
	abbreviations: string[];
};

export const johnBook: BibleBook = {
	id: 'john',
	names: ['John'],
	abbreviations: ['Jn', 'J']
};
