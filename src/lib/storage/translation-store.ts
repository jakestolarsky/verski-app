import type { TranslationManifest, TranslationPackage } from '../domain/translation-package';
import type { BibleRepository } from './bible-repository';

export interface TranslationStore extends BibleRepository {
	installTranslation(translationPackage: TranslationPackage): Promise<void>;

	removeTranslation(translationId: string): Promise<void>;

	getTranslationManifest(translationId: string): Promise<TranslationManifest | null>;
	getInstalledTranslationManifests(): Promise<TranslationManifest[]>;

	getInstalledChapterCount(translationId: string): Promise<number>;
}
