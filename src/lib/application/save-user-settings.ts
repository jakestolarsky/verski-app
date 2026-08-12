import type { UserSettings } from '../domain/user-settings';
import type { UserSettingsStore } from '../storage/user-settings-store';

export async function saveUserSettings(
	store: UserSettingsStore,
	settings: UserSettings
): Promise<void> {
	await store.replaceUserSettings(settings);
}
