import type { Passage } from './lookup-passage';

export type PassageCopyLabels = {
	bookName: string;
	translationName: string;
};

export function formatPassageForCopy(
	passage: Passage,
	labels: PassageCopyLabels
): string {
	const firstVerse = passage.verses[0];
	const lastVerse = passage.verses.at(-1);
    if (!firstVerse || !lastVerse) {
            throw new Error('Cannot format an empty passage');
        }

	const isSingleVerse = passage.verses.length === 1;

	const verseReference = isSingleVerse
		? `${firstVerse.number}`
		: `${firstVerse.number}-${lastVerse.number}`;

	const reference =
		`${labels.bookName} ${passage.chapter}:${verseReference}`;

	const passageText = isSingleVerse
		? firstVerse.text
		: passage.verses
				.map((verse) => `${verse.number} ${verse.text}`)
				.join('\n');

	return (
		`${reference} — ${labels.translationName}` +
		`\n\n${passageText}`
	);
}
