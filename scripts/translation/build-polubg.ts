import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import { protestantCanon } from '../../src/lib/domain/bible-canon.ts';
import type { TranslationManifest } from '../../src/lib/domain/translation-package.ts';
import { createTranslationPackage } from './create-translation-package.ts';
import { protestantBookIdsBySourceCode } from './protestant-vpl-book-map.ts';

const sourceUrl = new URL('../../bibles/polubg_vpl.xml', import.meta.url);
const outputUrl = new URL('../../static/translations/polubg.json', import.meta.url);

const manifest = {
	id: 'polubg',
	name: 'Uwspółcześniona Biblia Gdańska',
	language: 'pl-PL',
	version: '2025-12-12',
	license: 'CC BY-ND 4.0',
	licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
	source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
	sourceChecksum: 'sha256:15260b7b551446def9e253cd1ce1ef145bbfcdb9d172f4cf6f9f671d21f2c2cf',
	schemaVersion: 1,
	canonId: protestantCanon.id,
	bookIds: [...protestantCanon.bookIds]
} satisfies TranslationManifest;

const sourceBytes = await readFile(sourceUrl);

const actualChecksum = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`;

if (actualChecksum !== manifest.sourceChecksum) {
	throw new Error(
		`Source checksum mismatch. Expected ${manifest.sourceChecksum}, but received ${actualChecksum}.`
	);
}

const translationPackage = createTranslationPackage(
	sourceBytes.toString('utf8'),
	manifest,
	protestantBookIdsBySourceCode
);

const generatedBookIds = [
	...new Set(translationPackage.chapters.map((chapter) => chapter.bookId))
];

const hasExpectedBooks =
	generatedBookIds.length === manifest.bookIds.length &&
	generatedBookIds.every((bookId, index) => bookId === manifest.bookIds[index]);

if (!hasExpectedBooks) {
	throw new Error('Generated books do not match the Protestant canon.');
}

const expectedChapterCount = 1189;

if (translationPackage.chapters.length !== expectedChapterCount) {
	throw new Error(
		`Expected ${expectedChapterCount} chapters, received ${translationPackage.chapters.length}.`
	);
}

const generatedVerseCount = translationPackage.chapters.reduce(
	(total, chapter) => total + chapter.verses.length,
	0
);

const expectedVerseCount = 31102;

if (generatedVerseCount !== expectedVerseCount) {
	throw new Error(
		`Expected ${expectedVerseCount} verses, received ${generatedVerseCount}.`
	);
}

for (const bookId of manifest.bookIds) {
	const chapters = translationPackage.chapters.filter((chapter) => chapter.bookId === bookId);

	for (const [index, chapter] of chapters.entries()) {
		const expectedChapterNumber = index + 1;

		if (chapter.chapter !== expectedChapterNumber) {
			throw new Error(
				`Expected ${bookId} chapter ${expectedChapterNumber}, received chapter ${chapter.chapter}.`
			);
		}
	}
}

const json = `${JSON.stringify(translationPackage, null, 2)}\n`;

await writeFile(outputUrl, json, 'utf8');

console.log(
	`Created static/translations/polubg.json with ${generatedBookIds.length} books, ${translationPackage.chapters.length} chapters and ${generatedVerseCount} verses.`
);