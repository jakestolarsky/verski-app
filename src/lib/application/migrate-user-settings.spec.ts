import { describe, expect, it } from 'vitest';

import { defaultUserSettings } from '$lib/domain/user-settings';
import { migrateUserSettings } from './migrate-user-settings';

describe('migrateUserSettings', () => {
	it('returns defaults when settings have not been saved', () => {
		expect(migrateUserSettings(null)).toEqual(defaultUserSettings);
	});

	it('keeps valid version 1 settings', () => {
		const storedSettings = {
			version: 1,
			theme: 'dark',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual(storedSettings);
	});

	it('fills missing version 1 properties with defaults', () => {
		const storedSettings = {
			version: 1,
			theme: 'light',
			reading: {
				fontSize: 'large'
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual({
			...defaultUserSettings,
			theme: 'light',
			reading: {
				...defaultUserSettings.reading,
				fontSize: 'large'
			}
		});
	});

	it('returns defaults for invalid values', () => {
		const storedSettings = {
			version: 1,
			theme: 'neon',
			reading: {
				fontSize: 100,
				lineHeight: 'enormous',
				showVerseNumbers: 'sometimes'
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual(defaultUserSettings);
	});

	it('returns defaults for an unsupported future version', () => {
		expect(
			migrateUserSettings({
				version: 99,
				theme: 'dark'
			})
		).toEqual(defaultUserSettings);
	});
});
