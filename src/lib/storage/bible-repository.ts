import type { ChapterRecord } from '../domain/translation-package';

export interface BibleRepository {
	getChapter(
		translationId: string,
		bookId: string,
		chapter: number
	): Promise<ChapterRecord | null>;
}
