import { describe, expect, it } from 'vitest';

import type { UserSettings } from '../../domain/user-settings';
import { IndexedDbUserSettingsStore } from './indexed-db-user-settings-store';
import { openBibleDatabase } from './open-bible-database';

const settings = {
  version: 3,
  locale: 'en',
	theme: 'dark',
	selectedTranslationId: 'polubg',
	reading: {
		fontSize: 'large',
		lineHeight: 'relaxed',
		showVerseNumbers: false
	}
} satisfies UserSettings;

describe('IndexedDbUserSettingsStore', () => {
	it('returns null when settings have not been saved', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbUserSettingsStore(database);

		const result = await store.getStoredUserSettings();

		expect(result).toBeNull();

		database.close();
	});

	it('stores and returns user settings', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbUserSettingsStore(database);

		await store.replaceUserSettings(settings);

		const result = await store.getStoredUserSettings();

		expect(result).toEqual(settings);

		database.close();
	});

	it('replaces previously stored settings', async () => {
		const databaseName = `verski-test-${crypto.randomUUID()}`;
		const database = await openBibleDatabase(databaseName);
		const store = new IndexedDbUserSettingsStore(database);

		await store.replaceUserSettings(settings);

		const updatedSettings = {
			...settings,
			theme: 'light'
		} satisfies UserSettings;

		await store.replaceUserSettings(updatedSettings);

		const result = await store.getStoredUserSettings();

		expect(result).toEqual(updatedSettings);

		database.close();
	});
});
