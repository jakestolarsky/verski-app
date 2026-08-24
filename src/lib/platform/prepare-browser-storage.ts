import { addRecentLookup } from '../application/add-recent-lookup';
import { ensureTranslationInstalled } from '../application/ensure-translation-installed';
import type { RecentLookup } from '../domain/recent-lookup';
import type { TranslationManifest, TranslationPackage } from '../domain/translation-package';
import type { TranslationStore } from '../storage/translation-store';
import { IndexedDbBibleRepository } from '../storage/indexed-db/indexed-db-bible-repository';
import { IndexedDbRecentLookupStore } from '../storage/indexed-db/indexed-db-recent-lookup-store';
import { openBibleDatabase } from '../storage/indexed-db/open-bible-database';
import type { RecentLookupStore } from '../storage/recent-lookup-store';
import { loadUserSettings } from '../application/load-user-settings';
import { saveUserSettings } from '../application/save-user-settings';
import { defaultUserSettings, type UserSettings } from '../domain/user-settings';
import { IndexedDbUserSettingsStore } from '../storage/indexed-db/indexed-db-user-settings-store';
import type { UserSettingsStore } from '../storage/user-settings-store';

export type PreparedBrowserStorage = {
	bibleRepository: TranslationStore;
	recentLookupStore: RecentLookupStore | null;
	recentLookups: RecentLookup[];
	userSettingsStore: UserSettingsStore | null;
	userSettings: UserSettings;
	installedTranslationManifests: TranslationManifest[];
	close: () => void;
};

export async function prepareBrowserStorage(
	translationPackages: readonly TranslationPackage[],
	sessionLookups: readonly RecentLookup[],
	databaseName?: string
): Promise<PreparedBrowserStorage> {
	if (translationPackages.length === 0) {
		throw new Error('At least one translation package is required');
	}
	const database = await openBibleDatabase(databaseName);

	try {
		const bibleRepository = new IndexedDbBibleRepository(database);
		const historyStore = new IndexedDbRecentLookupStore(database);
		const settingsStore = new IndexedDbUserSettingsStore(database);

		let recentLookupStore: RecentLookupStore | null = historyStore;
		let recentLookups = [...sessionLookups];

		try {
			const storedLookups = await historyStore.getRecentLookups();

			recentLookups = storedLookups;

			for (const sessionLookup of [...sessionLookups].reverse()) {
				recentLookups = addRecentLookup(recentLookups, sessionLookup);
			}

			if (sessionLookups.length > 0) {
				await historyStore.replaceRecentLookups(recentLookups);
			}
		} catch {
			recentLookupStore = null;
		}

		let userSettingsStore: UserSettingsStore | null = settingsStore;
		let userSettings = structuredClone(defaultUserSettings);

		try {
			userSettings = await loadUserSettings(settingsStore);

			await saveUserSettings(settingsStore, userSettings);
		} catch {
			userSettingsStore = null;
		}

		for (const translationPackage of translationPackages) {
			await ensureTranslationInstalled(bibleRepository, translationPackage);
		}

		const installedTranslationManifests = await bibleRepository.getInstalledTranslationManifests();

		return {
			bibleRepository,
			installedTranslationManifests,
			recentLookupStore,
			recentLookups,
			userSettingsStore,
			userSettings,
			close() {
				database.close();
			}
		};
	} catch (error) {
		database.close();
		throw error;
	}
}
