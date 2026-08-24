import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { TranslationCatalogEntry } from '$lib/domain/translation-catalog';
import TranslationStorageSettings from './TranslationStorageSettings.svelte';

const translations = [
	{
		manifest: {
			id: 'engwebp',
			name: 'World English Bible',
			language: 'en-US',
			version: '2026-08-06',
			attribution: 'World English Bible — Public Domain',
			license: 'Public Domain',
			licenseUrl: 'https://ebible.org/legal.php',
			source: 'https://ebible.org',
			sourceChecksum: `sha256:${'a'.repeat(64)}`,
			schemaVersion: 1,
			canonId: 'protestant-66',
			bookIds: ['john']
		},
		packageUrl: '/translations/engwebp.json'
	},
	{
		manifest: {
			id: 'polubg',
			name: 'Uwspółcześniona Biblia Gdańska',
			language: 'pl-PL',
			version: '2025-12-12',
			attribution: '© 2018 Fundacja Wrota Nadziei',
			license: 'CC BY-ND 4.0',
			licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
			source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
			sourceChecksum: `sha256:${'b'.repeat(64)}`,
			schemaVersion: 1,
			canonId: 'protestant-66',
			bookIds: ['john']
		},
		packageUrl: '/translations/polubg.json'
	}
] satisfies TranslationCatalogEntry[];

describe('TranslationStorageSettings', () => {
	it('protects the bundled and active translations', async () => {
		render(TranslationStorageSettings, {
			translations,
			installedTranslationIds: ['engwebp', 'polubg'],
			activeTranslationId: 'polubg',
			defaultTranslationId: 'engwebp',
			onInstall: () => true,
			onRemove: () => true
		});

		await expect.element(page.getByText('Bundled with Verski')).toBeVisible();

		await expect
			.element(page.getByText('Select another translation before removing it.'))
			.toBeVisible();

		await expect
			.element(
				page.getByRole('button', {
					name: 'Remove Uwspółcześniona Biblia Gdańska'
				})
			)
			.toBeDisabled();
	});

	it('requests removal of an inactive installed translation', async () => {
		let removedTranslationId: string | null = null;

		render(TranslationStorageSettings, {
			translations,
			installedTranslationIds: ['engwebp', 'polubg'],
			activeTranslationId: 'engwebp',
			defaultTranslationId: 'engwebp',
			onInstall: () => true,
			onRemove(translationId: string) {
				removedTranslationId = translationId;
				return true;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Remove Uwspółcześniona Biblia Gdańska'
			})
		);

		expect(removedTranslationId).toBe('polubg');
	});

	it('requests installation of an unavailable translation', async () => {
		let installedTranslationId: string | null = null;

		render(TranslationStorageSettings, {
			translations,
			installedTranslationIds: ['engwebp'],
			activeTranslationId: 'engwebp',
			defaultTranslationId: 'engwebp',
			onInstall(translationId: string) {
				installedTranslationId = translationId;
				return true;
			},
			onRemove: () => true
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Install Uwspółcześniona Biblia Gdańska'
			})
		);

		expect(installedTranslationId).toBe('polubg');
	});

	it('shows an error when installation fails', async () => {
		render(TranslationStorageSettings, {
			translations,
			installedTranslationIds: ['engwebp'],
			activeTranslationId: 'engwebp',
			defaultTranslationId: 'engwebp',
			onInstall: () => false,
			onRemove: () => true
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Install Uwspółcześniona Biblia Gdańska'
			})
		);

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not update this translation.');
	});

	it('disables translation actions while storage is unavailable', async () => {
		render(TranslationStorageSettings, {
			translations,
			installedTranslationIds: ['engwebp'],
			activeTranslationId: 'engwebp',
			defaultTranslationId: 'engwebp',
			disabled: true,
			onInstall: () => true,
			onRemove: () => true
		});

		await expect
			.element(
				page.getByRole('button', {
					name: 'Install Uwspółcześniona Biblia Gdańska'
				})
			)
			.toBeDisabled();
	});
});
