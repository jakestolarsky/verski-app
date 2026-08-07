import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import type { TranslationManifest } from '../../src/lib/domain/translation-package.ts';
import { createTranslationPackage } from './create-translation-package.ts';

const sourceUrl = new URL('../../bibles/engwebp_vpl.xml', import.meta.url);

const outputUrl = new URL('../../static/translations/engwebp-john.json', import.meta.url);

const manifest = {
	id: 'engwebp',
	name: 'World English Bible',
	language: 'en-US',
	version: '2026-08-06',
	license: 'Public Domain',
	licenseUrl: 'https://ebible.org/legal.php',
	source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
	sourceChecksum: 'sha256:4ea4c923cd292be353a3fc3fdf6aae75b385a8823dc9834129c20ff53f8caa70',
	schemaVersion: 1,
	canonId: 'protestant-66',
	bookIds: ['john']
} satisfies TranslationManifest;

const sourceBytes = await readFile(sourceUrl);

const actualChecksum = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`;

if (actualChecksum !== manifest.sourceChecksum) {
	throw new Error(
		`Source checksum mismatch. Expected ${manifest.sourceChecksum}, but received ${actualChecksum}`
	);
}

const xml = sourceBytes.toString('utf8');

const translationPackage = createTranslationPackage(xml, manifest, {
	JHN: 'john'
});

const expectedChapterCount = 21;

if (translationPackage.chapters.length !== expectedChapterCount) {
	throw new Error(
		`Expected ${expectedChapterCount} chapters of John, but received ${translationPackage.chapters.length}`
	);
}

const json = `${JSON.stringify(translationPackage, null, 2)}\n`;

await writeFile(outputUrl, json, 'utf8');

console.log(
	`Created static/translations/engwebp-john.json with ${translationPackage.chapters.length} chapters.`
);
