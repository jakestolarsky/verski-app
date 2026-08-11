import type { BibleReference } from '../domain/bible-reference';
import { formatBibleReference } from './format-bible-reference';
import type { Passage } from './lookup-passage';

export type PassageCopyOptions = {
	reference: BibleReference;
	bookName: string;
	translationName: string;
};

export function formatPassageForCopy(passage: Passage, options: PassageCopyOptions): string {
	const firstVerse = passage.verses[0];
	const lastVerse = passage.verses.at(-1);

	if (!firstVerse || !lastVerse) {
		throw new Error('Cannot format an empty passage');
	}

	const isSingleVerse = passage.verses.length === 1;
	const reference = formatBibleReference(options.reference, options.bookName);

	const passageText = isSingleVerse
		? firstVerse.text
		: passage.verses.map((verse) => `${verse.number} ${verse.text}`).join('\n');

	return `${reference} (${options.translationName})\n\n${passageText}`;
}
