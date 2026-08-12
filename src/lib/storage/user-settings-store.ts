import type { UserSettings } from '../domain/user-settings';

export interface UserSettingsStore {
	getStoredUserSettings(): Promise<unknown>;

	replaceUserSettings(settings: UserSettings): Promise<void>;
}
