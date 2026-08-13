import type { ChapterRecord, TranslationPackage } from '../domain/translation-package';
import type { BibleRepository } from './bible-repository';

export class StaticBibleRepository implements BibleRepository {
	constructor(private readonly translationPackage: TranslationPackage) {}

	async getChapter(
		translationId: string,
		bookId: string,
		chapter: number
	): Promise<ChapterRecord | null> {
		return (
			this.translationPackage.chapters.find(
				(record) =>
					record.translationId === translationId &&
					record.bookId === bookId &&
					record.chapter === chapter
			) ?? null
		);
	}
}
