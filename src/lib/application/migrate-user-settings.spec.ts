import { describe, expect, it } from 'vitest';

import { defaultUserSettings } from '$lib/domain/user-settings';
import { migrateUserSettings } from './migrate-user-settings';

describe('migrateUserSettings', () => {
	it('returns defaults when settings have not been saved', () => {
		expect(migrateUserSettings(null)).toEqual(defaultUserSettings);
	});

	it('keeps valid version 3 settings', () => {
		const storedSettings = {
			version: 3,
			locale: 'pl',
			theme: 'dark',
			selectedTranslationId: 'polubg',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual(storedSettings);
	});

	it('migrates version 2 settings and adds the default locale', () => {
		const storedSettings = {
			version: 2,
			theme: 'dark',
			selectedTranslationId: 'polubg',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual({
			version: 3,
			locale: 'en',
			theme: 'dark',
			selectedTranslationId: 'polubg',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		});
	});

	it('migrates version 1 settings and preserves their existing values', () => {
		const storedSettings = {
			version: 1,
			theme: 'dark',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		};

		expect(migrateUserSettings(storedSettings)).toEqual({
			version: 3,
			locale: 'en',
			theme: 'dark',
			selectedTranslationId: 'engwebp',
			reading: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			}
		});
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

	it('returns defaults for invalid current values', () => {
		const storedSettings = {
			version: 3,
			locale: 'unsupported',
			theme: 'neon',
			selectedTranslationId: '',
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
				locale: 'pl',
				theme: 'dark'
			})
		).toEqual(defaultUserSettings);
	});
});
