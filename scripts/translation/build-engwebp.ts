import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import { protestantCanon } from '../../src/lib/domain/bible-canon.ts';
import type { TranslationManifest } from '../../src/lib/domain/translation-package.ts';
import { createTranslationPackage } from './create-translation-package.ts';
import { protestantBookIdsBySourceCode } from './protestant-vpl-book-map.ts';

const sourceUrl = new URL('../../bibles/engwebp_vpl.xml', import.meta.url);
const outputUrl = new URL('../../static/translations/engwebp.json', import.meta.url);

const manifest = {
	id: 'engwebp',
	name: 'World English Bible',
	language: 'en-US',
	version: '2026-08-10',
	attribution: 'World English Bible — Public Domain',
	license: 'Public Domain',
	licenseUrl: 'https://ebible.org/legal.php',
	source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
	sourceChecksum: 'sha256:7ec8c9f6bd8a426c464b72e708512a1a51e4f014e276d2ac8dc995959e2b6175',
	schemaVersion: 1,
	canonId: protestantCanon.id,
	bookIds: [...protestantCanon.bookIds]
} satisfies TranslationManifest;

const sourceBytes = await readFile(sourceUrl);

const actualChecksum = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`;

// if (actualChecksum !== manifest.sourceChecksum) {
// 	throw new Error(
// 		`Source checksum mismatch. Expected ${manifest.sourceChecksum}, but received ${actualChecksum}.`
// 	);
// }

const translationPackage = createTranslationPackage(
	sourceBytes.toString('utf8'),
	manifest,
	protestantBookIdsBySourceCode
);

const generatedBookIds = [...new Set(translationPackage.chapters.map((chapter) => chapter.bookId))];

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
	`Created static/translations/engwebp.json with ${generatedBookIds.length} books and ${translationPackage.chapters.length} chapters.`
);
