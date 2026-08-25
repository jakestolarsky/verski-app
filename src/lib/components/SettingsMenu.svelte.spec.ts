import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { defaultUserSettings, type UserSettings } from '$lib/domain/user-settings';
import SettingsMenu from './SettingsMenu.svelte';
import { appMetadata } from '$lib/platform/app-metadata';
import type { TranslationManifest } from '$lib/domain/translation-package';

const translationManifest = {
	id: 'engwebp',
	name: 'World English Bible',
	language: 'en-US',
	version: '2026-08-10',
	attribution: 'World English Bible — Public Domain',
	license: 'Public Domain',
	licenseUrl: 'https://ebible.org/legal.php',
	source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
	sourceChecksum: 'sha256:7ec8c9f6bd8a426c464b72e708512a1a51e4f014e276d2ac8dc995959e2b6175',
	schemaVersion: 1,
	canonId: 'protestant-66',
	bookIds: ['john']
} satisfies TranslationManifest;

afterEach(() => {
	delete document.documentElement.dataset.theme;
	localStorage.removeItem('verski-theme');
});

describe('SettingsMenu', () => {
	it('opens an accessible settings dialog', async () => {
		render(SettingsMenu, {
			translationManifest,
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

		await expect.element(page.getByRole('radio', { name: 'System theme' })).toBeChecked();
	});

	it('applies the selected theme and reports updated settings', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			translationManifest,
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

		await userEvent.click(
			page.getByRole('radio', {
				name: 'Dark theme'
			})
		);

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			theme: 'dark'
		});
		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(localStorage.getItem('verski-theme')).toBe('dark');
	});

	it('closes with Escape and returns focus to the settings button', async () => {
		render(SettingsMenu, {
			translationManifest,
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
			translationManifest,
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

		await userEvent.click(
			page.getByRole('button', {
				name: 'Increase text size'
			})
		);

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
			translationManifest,
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

		await userEvent.click(
			page.getByRole('button', {
				name: 'Increase line spacing'
			})
		);

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
			translationManifest,
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

		const verseNumbersCheckbox = page.getByRole('checkbox', {
			name: 'Show verse numbers'
		});

		await expect.element(verseNumbersCheckbox).toBeChecked();

		await userEvent.click(verseNumbersCheckbox);

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			reading: {
				...defaultUserSettings.reading,
				showVerseNumbers: false
			}
		});
	});

	it('switches settings sections with pointer and keyboard', async () => {
		render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			onChange() {}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));

		const displayTab = page.getByRole('tab', { name: 'Display' });
		const systemTab = page.getByRole('tab', { name: 'System' });
		const aboutTab = page.getByRole('tab', { name: 'About' });

		await expect.element(displayTab).toHaveAttribute('aria-selected', 'true');

		await userEvent.click(systemTab);

		await expect.element(systemTab).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('tabpanel', { name: 'System' })).toBeVisible();

		await userEvent.keyboard('{ArrowRight}');

		await expect.element(aboutTab).toHaveFocus();
		await expect.element(aboutTab).toHaveAttribute('aria-selected', 'true');

		await userEvent.keyboard('{Home}');

		await expect.element(displayTab).toHaveFocus();
		await expect.element(displayTab).toHaveAttribute('aria-selected', 'true');
	});

	it('updates the reading preview when settings change', async () => {
		const onChange = () => {};

		const screen = render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			onChange
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));

		const preview = page.getByRole('region', {
			name: 'Reading preview'
		});

		await expect.element(preview).toHaveAttribute('data-font-size', 'default');
		await expect.element(preview).toHaveAttribute('data-line-height', 'default');

		await screen.rerender({
			settings: {
				...defaultUserSettings,
				reading: {
					fontSize: 'large',
					lineHeight: 'relaxed',
					showVerseNumbers: false
				}
			},
			onChange
		});

		await expect.element(preview).toHaveAttribute('data-font-size', 'large');
		await expect.element(preview).toHaveAttribute('data-line-height', 'relaxed');

		const previewElement = document.querySelector('.reading-preview');

		expect(previewElement?.querySelector('sup')).toBeNull();
	});

	it('disables decrement controls at the smallest reading values', async () => {
		render(SettingsMenu, {
			translationManifest,
			settings: {
				...defaultUserSettings,
				reading: {
					fontSize: 'small',
					lineHeight: 'compact',
					showVerseNumbers: true
				}
			},
			onChange() {}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));

		await expect.element(page.getByRole('button', { name: 'Decrease text size' })).toBeDisabled();

		await expect
			.element(page.getByRole('button', { name: 'Decrease line spacing' }))
			.toBeDisabled();
	});

	it('reports clearing recent lookups from the System section', async () => {
		let clearCalls = 0;

		render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			recentLookupCount: 3,
			onChange() {},
			onClearRecentLookups() {
				clearCalls += 1;
			}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));
		await userEvent.click(page.getByRole('tab', { name: 'System' }));

		const clearHistoryButton = page.getByRole('button', {
			name: 'Clear history'
		});

		await expect.element(clearHistoryButton).toBeEnabled();

		await userEvent.click(clearHistoryButton);

		expect(clearCalls).toBe(1);
	});

	it('disables clearing when recent history is empty', async () => {
		render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			recentLookupCount: 0,
			onChange() {}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));
		await userEvent.click(page.getByRole('tab', { name: 'System' }));

		await expect.element(page.getByRole('button', { name: 'Clear history' })).toBeDisabled();
	});

	it('shows application and translation metadata in About', async () => {
		render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			onChange() {}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));
		await userEvent.click(page.getByRole('tab', { name: 'About' }));

		await expect.element(page.getByText(appMetadata.version)).toBeVisible();
		await expect.element(page.getByText(appMetadata.commit)).toBeVisible();
		await expect.element(page.getByText(appMetadata.author)).toBeVisible();

		await expect
			.element(page.getByRole('link', { name: 'GitHub repository' }))
			.toHaveAttribute('href', appMetadata.repositoryUrl);

		await expect.element(page.getByRole('heading', { name: 'Current translation' })).toBeVisible();

		await expect.element(page.getByText(translationManifest.name, { exact: true })).toBeVisible();

		await expect
			.element(page.getByRole('link', { name: translationManifest.license }))
			.toHaveAttribute('href', translationManifest.licenseUrl);
	});

	it('reports a locale change from the System section', async () => {
		let changedSettings: UserSettings | null = null;

		render(SettingsMenu, {
			translationManifest,
			settings: structuredClone(defaultUserSettings),
			onChange(settings: UserSettings) {
				changedSettings = settings;
			}
		});

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));
		await userEvent.click(page.getByRole('tab', { name: 'System' }));

		const languageSelect = page.getByRole('combobox', {
			name: 'Language'
		});

		await expect.element(languageSelect).toHaveValue('en');

		await userEvent.selectOptions(languageSelect, 'pl');

		expect(changedSettings).toEqual({
			...defaultUserSettings,
			locale: 'pl'
		});
	});
});
