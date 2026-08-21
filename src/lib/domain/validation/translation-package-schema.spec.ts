import { describe, expect, it } from 'vitest';
import type { TranslationPackage } from '../translation-package';
import { translationPackageSchema } from './translation-package-schema';

const validPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		attribution: 'World English Bible — Public Domain',
		license: 'Public Domain',
		licenseUrl: 'https://ebible.org/legal.php',
		source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
		sourceChecksum: 'sha256:4ea4c923cd292be353a3fc3fdf6aae75b385a8823dc9834129c20ff53f8caa70',
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	chapters: [
		{
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: ['In the beginning was the Word.']
		}
	]
} satisfies TranslationPackage;

describe('translationPackageSchema', () => {
	it('accepts a valid translation package', () => {
		const result = translationPackageSchema.safeParse(validPackage);

		expect(result.success).toBe(true);
	});

	it('rejects an unsupported schema version', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			manifest: {
				...validPackage.manifest,
				schemaVersion: 2
			}
		});

		expect(result.success).toBe(false);
	});

	it('rejects an invalid source checksum', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			manifest: {
				...validPackage.manifest,
				sourceChecksum: 'not-a-checksum'
			}
		});

		expect(result.success).toBe(false);
	});

	it('rejects chapter zero', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			chapters: [
				{
					...validPackage.chapters[0],
					chapter: 0
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects a chapter without verses', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			chapters: [
				{
					...validPackage.chapters[0],
					verses: []
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects duplicate book identifiers in the manifest', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			manifest: {
				...validPackage.manifest,
				bookIds: ['john', 'john']
			}
		});

		expect(result.success).toBe(false);
	});

	it('rejects a chapter belonging to a different translation', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			chapters: [
				{
					...validPackage.chapters[0],
					translationId: 'another-translation'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects a chapter whose book is not declared in the manifest', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			chapters: [
				{
					...validPackage.chapters[0],
					bookId: 'romans'
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects duplicate chapters', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			chapters: [validPackage.chapters[0], { ...validPackage.chapters[0] }]
		});

		expect(result.success).toBe(false);
	});

	it('rejects an empty attribution', () => {
		const result = translationPackageSchema.safeParse({
			...validPackage,
			manifest: {
				...validPackage.manifest,
				attribution: ''
			}
		});

		expect(result.success).toBe(false);
	});
});
