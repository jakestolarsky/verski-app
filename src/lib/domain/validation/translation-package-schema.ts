import * as z from 'zod';
import type { TranslationPackage } from '../translation-package';

const nonEmptyTextSchema = z.string().trim().min(1);
const positiveIntegerSchema = z.number().int().positive();

const sourceChecksumSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);

const verseTextSchema = z.string().refine((text) => text.trim().length > 0, {
	message: 'Verse text cannot be empty'
});

const translationManifestSchema = z.object({
	id: nonEmptyTextSchema,
	name: nonEmptyTextSchema,
	language: nonEmptyTextSchema,
	version: nonEmptyTextSchema,
	license: nonEmptyTextSchema,
	licenseUrl: z.url(),
	source: z.url(),
	sourceChecksum: sourceChecksumSchema,
	schemaVersion: z.literal(1),
	canonId: nonEmptyTextSchema,
	bookIds: z
		.array(nonEmptyTextSchema)
		.min(1)
		.refine((bookIds) => new Set(bookIds).size === bookIds.length, {
			message: 'Book identifiers must be unique'
		})
});

const chapterRecordSchema = z.object({
	translationId: nonEmptyTextSchema,
	bookId: nonEmptyTextSchema,
	chapter: positiveIntegerSchema,
	verses: z.array(verseTextSchema).min(1)
});

export const translationPackageSchema: z.ZodType<TranslationPackage> = z
	.object({
		manifest: translationManifestSchema,
		chapters: z.array(chapterRecordSchema).min(1)
	})
	.superRefine((translationPackage, context) => {
		const { manifest, chapters } = translationPackage;
		const chapterKeys = new Set<string>();

		chapters.forEach((chapter, index) => {
			if (chapter.translationId !== manifest.id) {
				context.addIssue({
					code: 'custom',
					message: 'Chapter translation must match the manifest',
					path: ['chapters', index, 'translationId']
				});
			}

			if (!manifest.bookIds.includes(chapter.bookId)) {
				context.addIssue({
					code: 'custom',
					message: 'Chapter book must be declared in the manifest',
					path: ['chapters', index, 'bookId']
				});
			}

			const chapterKey = JSON.stringify([chapter.translationId, chapter.bookId, chapter.chapter]);

			if (chapterKeys.has(chapterKey)) {
				context.addIssue({
					code: 'custom',
					message: 'Chapter must be unique',
					path: ['chapters', index]
				});
			}

			chapterKeys.add(chapterKey);
		});
	});
