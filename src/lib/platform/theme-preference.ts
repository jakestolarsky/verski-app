import { isTheme, type Theme } from '../domain/user-settings';


export const THEME_STORAGE_KEY = 'verski-theme';

export function readStoredThemePreference(): Exclude<Theme, 'system'> | null {
	const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

	if (isTheme(storedTheme) && storedTheme !== 'system') {
		return storedTheme;
	}

	return null;
}

export function applyThemePreference(theme: Theme): void {
	if (theme === 'system') {
		delete document.documentElement.dataset.theme;
		localStorage.removeItem(THEME_STORAGE_KEY);
		return;
	}

	document.documentElement.dataset.theme = theme;
	localStorage.setItem(THEME_STORAGE_KEY, theme);
}
