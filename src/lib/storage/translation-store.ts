import type { TranslationManifest, TranslationPackage } from '../domain/translation-package';
import type { BibleRepository } from './bible-repository';

export interface TranslationStore extends BibleRepository {
	installTranslation(translationPackage: TranslationPackage): Promise<void>;

	getTranslationManifest(translationId: string): Promise<TranslationManifest | null>;

	getInstalledChapterCount(translationId: string): Promise<number>;
}
