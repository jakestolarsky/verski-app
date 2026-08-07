export type TranslationManifest = {
	id: string;
	name: string;
	language: string;
	version: string;
	license: string;
	licenseUrl: string;
	source: string;
	sourceChecksum: string;
	schemaVersion: 1;
    canonId: string;
	bookIds: string[];
};

export type ChapterRecord = {
	translationId: string;
	bookId: string;
	chapter: number;
	verses: string[];
};

export type TranslationPackage = {
	manifest: TranslationManifest;
	chapters: ChapterRecord[];
};