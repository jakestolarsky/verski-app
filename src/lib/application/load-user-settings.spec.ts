import { describe, expect, it } from 'vitest';

import type { UserSettingsStore } from '../storage/user-settings-store';
import { loadUserSettings } from './load-user-settings';

describe('loadUserSettings', () => {
	it('migrates settings read from storage', async () => {
		const store: UserSettingsStore = {
			async getStoredUserSettings() {
				return {
					version: 1,
					theme: 'dark',
					reading: {
						fontSize: 'large'
					}
				};
			},

			async replaceUserSettings() {}
		};

		await expect(loadUserSettings(store)).resolves.toEqual({
			version: 3,
      		locale: 'en',
	  		theme: 'dark',
			selectedTranslationId: 'engwebp',
			reading: {
				fontSize: 'large',
				lineHeight: 'default',
				showVerseNumbers: true
			}
		});
	});
});
