import type { UserSettings } from '../domain/user-settings';
import type { UserSettingsStore } from '../storage/user-settings-store';
import { migrateUserSettings } from './migrate-user-settings';

export async function loadUserSettings(store: UserSettingsStore): Promise<UserSettings> {
	const storedValue = await store.getStoredUserSettings();

	return migrateUserSettings(storedValue);
}
