import { protestantCanon } from '../../src/lib/domain/bible-canon.ts';

const sourceBookCodes = [
	'GEN',
	'EXO',
	'LEV',
	'NUM',
	'DEU',
	'JOS',
	'JDG',
	'RUT',
	'1SA',
	'2SA',
	'1KI',
	'2KI',
	'1CH',
	'2CH',
	'EZR',
	'NEH',
	'EST',
	'JOB',
	'PSA',
	'PRO',
	'ECC',
	'SNG',
	'ISA',
	'JER',
	'LAM',
	'EZK',
	'DAN',
	'HOS',
	'JOL',
	'AMO',
	'OBA',
	'JON',
	'MIC',
	'NAM',
	'HAB',
	'ZEP',
	'HAG',
	'ZEC',
	'MAL',
	'MAT',
	'MRK',
	'LUK',
	'JHN',
	'ACT',
	'ROM',
	'1CO',
	'2CO',
	'GAL',
	'EPH',
	'PHP',
	'COL',
	'1TH',
	'2TH',
	'1TI',
	'2TI',
	'TIT',
	'PHM',
	'HEB',
	'JAS',
	'1PE',
	'2PE',
	'1JN',
	'2JN',
	'3JN',
	'JUD',
	'REV'
] as const;

if (sourceBookCodes.length !== protestantCanon.bookIds.length) {
	throw new Error(
		`Expected ${protestantCanon.bookIds.length} source book codes, received ${sourceBookCodes.length}.`
	);
}

export const protestantBookIdsBySourceCode: Readonly<Record<string, string>> =
	Object.fromEntries(
		sourceBookCodes.map((sourceBookCode, index) => {
			const bookId = protestantCanon.bookIds[index];

			if (!bookId) {
				throw new Error(`No canonical book identifier for source code ${sourceBookCode}.`);
			}

			return [sourceBookCode, bookId] as const;
		})
	);