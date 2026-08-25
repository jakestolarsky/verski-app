import { BUNDLED_DEFAULT_TRANSLATION_ID } from './translation-catalog';

export const CURRENT_USER_SETTINGS_VERSION = 3;

export const availableThemes = ['system', 'light', 'dark'] as const;
export type Theme = (typeof availableThemes)[number];

export function isTheme(value: unknown): value is Theme {
	return typeof value === 'string' && availableThemes.includes(value as Theme);
}

export const availableLocales = ['en', 'pl'] as const;
export type AppLocale = (typeof availableLocales)[number];

export function isAppLocale(value: unknown): value is AppLocale {
	return typeof value === 'string' && availableLocales.includes(value as AppLocale);
}

export type ReadingFontSize = 'small' | 'default' | 'large';

export type ReadingLineHeight = 'compact' | 'default' | 'relaxed';

export type UserSettings = {
	version: typeof CURRENT_USER_SETTINGS_VERSION;
	locale: AppLocale;
	theme: Theme;
	selectedTranslationId: string;
	reading: ReadingSettings;
};

export const defaultUserSettings: UserSettings = {
	version: CURRENT_USER_SETTINGS_VERSION,
	locale: 'en',
	theme: 'system',
	selectedTranslationId: BUNDLED_DEFAULT_TRANSLATION_ID,
	reading: {
		fontSize: 'default',
		lineHeight: 'default',
		showVerseNumbers: true
	}
};

export type ReadingSettings = {
	fontSize: ReadingFontSize;
	lineHeight: ReadingLineHeight;
	showVerseNumbers: boolean;
};
