import { z } from 'zod';

import {
	CURRENT_USER_SETTINGS_VERSION,
	availableThemes,
	defaultUserSettings,
	type UserSettings
} from '$lib/domain/user-settings';

const themeSchema = z.enum(availableThemes).default(defaultUserSettings.theme);

const readingSettingsSchema = z
	.object({
		fontSize: z.enum(['small', 'default', 'large']).default(defaultUserSettings.reading.fontSize),
		lineHeight: z
			.enum(['compact', 'default', 'relaxed'])
			.default(defaultUserSettings.reading.lineHeight),
		showVerseNumbers: z.boolean().default(defaultUserSettings.reading.showVerseNumbers)
	})
	.default(defaultUserSettings.reading);

const versionOneSettingsSchema = z.object({
	version: z.literal(1),
	theme: themeSchema,
	reading: readingSettingsSchema
});

const currentSettingsSchema: z.ZodType<UserSettings> = z.object({
	version: z.literal(CURRENT_USER_SETTINGS_VERSION),
	theme: themeSchema,
	selectedTranslationId: z.string().trim().min(1),
	reading: readingSettingsSchema
});

export function migrateUserSettings(storedValue: unknown): UserSettings {
	const currentResult = currentSettingsSchema.safeParse(storedValue);

	if (currentResult.success) {
		return currentResult.data;
	}

	const versionOneResult = versionOneSettingsSchema.safeParse(storedValue);

	if (versionOneResult.success) {
		return {
			...versionOneResult.data,
			version: CURRENT_USER_SETTINGS_VERSION,
			selectedTranslationId: defaultUserSettings.selectedTranslationId
		};
	}

	return structuredClone(defaultUserSettings);
}
