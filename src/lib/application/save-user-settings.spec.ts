import { describe, expect, it } from 'vitest';

import type { UserSettings } from '../domain/user-settings';
import type { UserSettingsStore } from '../storage/user-settings-store';
import { saveUserSettings } from './save-user-settings';

describe('saveUserSettings', () => {
	it('replaces the stored settings', async () => {
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

		let savedSettings: UserSettings | null = null;

		const store: UserSettingsStore = {
			async getStoredUserSettings() {
				return null;
			},

			async replaceUserSettings(nextSettings) {
				savedSettings = nextSettings;
			}
		};

		await saveUserSettings(store, settings);

		expect(savedSettings).toEqual(settings);
	});
});
