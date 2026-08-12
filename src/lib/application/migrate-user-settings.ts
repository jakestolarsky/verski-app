import { z } from 'zod';

import {
	CURRENT_USER_SETTINGS_VERSION,
	defaultUserSettings,
	type UserSettings
} from '$lib/domain/user-settings';

const versionOneSettingsSchema = z.object({
	version: z.literal(CURRENT_USER_SETTINGS_VERSION),
	theme: z.enum(['system', 'light', 'dark']).default(defaultUserSettings.theme),
	reading: z
		.object({
			fontSize: z.enum(['small', 'default', 'large']).default(defaultUserSettings.reading.fontSize),
			lineHeight: z
				.enum(['compact', 'default', 'relaxed'])
				.default(defaultUserSettings.reading.lineHeight),
			showVerseNumbers: z.boolean().default(defaultUserSettings.reading.showVerseNumbers)
		})
		.default(defaultUserSettings.reading)
});

export function migrateUserSettings(storedValue: unknown): UserSettings {
	const result = versionOneSettingsSchema.safeParse(storedValue);

	if (!result.success) {
		return structuredClone(defaultUserSettings);
	}

	return result.data;
}
