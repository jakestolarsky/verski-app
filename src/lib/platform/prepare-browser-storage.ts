import { addRecentLookup } from '../application/add-recent-lookup';
import { ensureTranslationInstalled } from '../application/ensure-translation-installed';
import type { RecentLookup } from '../domain/recent-lookup';
import type { TranslationPackage } from '../domain/translation-package';
import type { BibleRepository } from '../storage/bible-repository';
import { IndexedDbBibleRepository } from '../storage/indexed-db/indexed-db-bible-repository';
import { IndexedDbRecentLookupStore } from '../storage/indexed-db/indexed-db-recent-lookup-store';
import { openBibleDatabase } from '../storage/indexed-db/open-bible-database';
import type { RecentLookupStore } from '../storage/recent-lookup-store';

export type PreparedBrowserStorage = {
	bibleRepository: BibleRepository;
	recentLookupStore: RecentLookupStore | null;
	recentLookups: RecentLookup[];
	close: () => void;
};

export async function prepareBrowserStorage(
	translationPackage: TranslationPackage,
	sessionLookups: readonly RecentLookup[],
	databaseName?: string
): Promise<PreparedBrowserStorage> {
	const database = await openBibleDatabase(databaseName);

	try {
		const bibleRepository = new IndexedDbBibleRepository(database);
		const historyStore = new IndexedDbRecentLookupStore(database);

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

		await ensureTranslationInstalled(bibleRepository, translationPackage);

		return {
			bibleRepository,
			recentLookupStore,
			recentLookups,
			close() {
				database.close();
			}
		};
	} catch (error) {
		database.close();
		throw error;
	}
}
