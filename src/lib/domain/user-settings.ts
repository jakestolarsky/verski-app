export const CURRENT_USER_SETTINGS_VERSION = 1;

export const availableThemes = ['system', 'light', 'dark'] as const;
export type Theme = (typeof availableThemes)[number];

export function isTheme(value: unknown): value is Theme {
	return typeof value === 'string' && availableThemes.includes(value as Theme);
}
export type ReadingFontSize = 'small' | 'default' | 'large';

export type ReadingLineHeight = 'compact' | 'default' | 'relaxed';

export type UserSettings = {
	version: typeof CURRENT_USER_SETTINGS_VERSION;
	theme: Theme;
	reading: ReadingSettings;
};

export const defaultUserSettings: UserSettings = {
	version: CURRENT_USER_SETTINGS_VERSION,
	theme: 'system',
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
