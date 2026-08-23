import * as z from 'zod';

import type { TranslationCatalog } from '../translation-catalog';
import { translationManifestSchema } from './translation-package-schema.ts';

const translationCatalogEntrySchema = z.object({
	manifest: translationManifestSchema,
	packageUrl: z.string().regex(/^\/translations\/[^/]+\.json$/)
});

export const translationCatalogSchema: z.ZodType<TranslationCatalog> = z
	.object({
		defaultTranslationId: z.string().trim().min(1),
		translations: z.array(translationCatalogEntrySchema).min(1)
	})
	.superRefine((catalog, context) => {
		const translationIds = catalog.translations.map((entry) => entry.manifest.id);

		if (new Set(translationIds).size !== translationIds.length) {
			context.addIssue({
				code: 'custom',
				message: 'Translation identifiers must be unique',
				path: ['translations']
			});
		}

		if (!translationIds.includes(catalog.defaultTranslationId)) {
			context.addIssue({
				code: 'custom',
				message: 'Default translation must exist in the catalog',
				path: ['defaultTranslationId']
			});
		}

		catalog.translations.forEach((entry, index) => {
			const expectedPackageUrl = `/translations/${entry.manifest.id}.json`;

			if (entry.packageUrl !== expectedPackageUrl) {
				context.addIssue({
					code: 'custom',
					message: 'Package URL must match the translation identifier',
					path: ['translations', index, 'packageUrl']
				});
			}
		});
	});
