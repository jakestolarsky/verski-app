import * as z from 'zod';
import type { BibleReference } from '../bible-reference';

const positiveIntegerSchema = z.number().int().positive();

export const bibleReferenceSchema: z.ZodType<BibleReference> = z.object({
    bookId: z.string().trim().min(1),
    chapter: positiveIntegerSchema,
    verseStart: positiveIntegerSchema.optional(),
    verseEnd: positiveIntegerSchema.optional()
});