import type {
	TranslationManifest,
	TranslationPackage
} from '../../src/lib/domain/translation-package.ts';
import { translationPackageSchema } from '../../src/lib/domain/validation/translation-package-schema.ts';
import { createChapterRecords, parseVplVerses } from './parse-vpl.ts';

export function createTranslationPackage(
	xml: string,
	manifest: TranslationManifest,
	includedBookIdsBySourceCode: Readonly<Record<string, string>>
): TranslationPackage {
	const verses = parseVplVerses(xml);

	const chapters = createChapterRecords(verses, manifest.id, includedBookIdsBySourceCode);

	return translationPackageSchema.parse({
		manifest,
		chapters
	});
}
