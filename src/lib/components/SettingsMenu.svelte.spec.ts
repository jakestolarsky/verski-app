import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { defaultUserSettings, type UserSettings } from '$lib/domain/user-settings';
import SettingsMenu from './SettingsMenu.svelte';

afterEach(() => {
	delete document.documentElement.dataset.theme;
	localStorage.removeItem('verski-theme');
});

describe('SettingsMenu', () => {
	it('opens an accessible settings dialog', async () => {
		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange() {}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Settings'
			})
		);

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Settings'
				})
			)
			.toBeVisible();

		await expect.element(page.getByLabelText('Theme')).toHaveValue('system');
	});

	it('applies the selected theme and reports updated settings', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange(settings: UserSettings) {
				changedSettings = settings;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Settings'
			})
		);

		await userEvent.selectOptions(page.getByLabelText('Theme'), 'dark');

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			theme: 'dark'
		});
		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(localStorage.getItem('verski-theme')).toBe('dark');
	});

	it('closes with Escape and returns focus to the settings button', async () => {
		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange() {}
		});

		const settingsButton = page.getByRole('button', {
			name: 'Settings'
		});

		await userEvent.click(settingsButton);
		await userEvent.keyboard('{Escape}');

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Settings',
					includeHidden: true
				})
			)
			.not.toBeVisible();

		await expect.element(settingsButton).toHaveFocus();
	});

	it('reports a reading text size change', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange(settings: UserSettings) {
				changedSettings = settings;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Settings'
			})
		);

		await userEvent.selectOptions(page.getByLabelText('Text size'), 'large');

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			reading: {
				...defaultUserSettings.reading,
				fontSize: 'large'
			}
		});
	});

	it('reports a reading line spacing change', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange(settings: UserSettings) {
				changedSettings = settings;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Settings'
			})
		);

		await userEvent.selectOptions(page.getByLabelText('Line spacing'), 'relaxed');

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			reading: {
				...defaultUserSettings.reading,
				lineHeight: 'relaxed'
			}
		});
	});

	it('reports a verse number visibility change', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			settings: structuredClone(defaultUserSettings),
			onChange(settings: UserSettings) {
				changedSettings = settings;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Settings'
			})
		);

		await userEvent.click(page.getByLabelText('Show verse numbers'));

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			reading: {
				...defaultUserSettings.reading,
				showVerseNumbers: false
			}
		});
	});
});
