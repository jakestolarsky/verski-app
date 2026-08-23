import { readFile, writeFile } from 'node:fs/promises';

import { translationCatalogSchema } from '../../src/lib/domain/validation/translation-catalog-schema.ts';
import { translationPackageSchema } from '../../src/lib/domain/validation/translation-package-schema.ts';

const translationSources = [
	{
		packageUrl: '/translations/engwebp.json',
		fileUrl: new URL('../../static/translations/engwebp.json', import.meta.url)
	},
	{
		packageUrl: '/translations/polubg.json',
		fileUrl: new URL('../../static/translations/polubg.json', import.meta.url)
	}
] as const;

const translations = await Promise.all(
	translationSources.map(async ({ packageUrl, fileUrl }) => {
		const source = await readFile(fileUrl, 'utf8');
		const translationPackage = translationPackageSchema.parse(JSON.parse(source));

		return {
			manifest: translationPackage.manifest,
			packageUrl
		};
	})
);

const catalog = translationCatalogSchema.parse({
	defaultTranslationId: 'engwebp',
	translations
});

const outputUrl = new URL('../../static/translations/catalog.json', import.meta.url);
const json = `${JSON.stringify(catalog, null, 2)}\n`;

await writeFile(outputUrl, json, 'utf8');

console.log(`Created static/translations/catalog.json with ${translations.length} translations.`);
