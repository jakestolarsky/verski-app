import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { TranslationCatalogEntry } from '$lib/domain/translation-catalog';
import TranslationSelector from './TranslationSelector.svelte';

const translations = [
	{
		manifest: {
			id: 'engwebp',
			name: 'World English Bible',
			language: 'en-US',
			version: '2026-08-10',
			attribution: 'World English Bible — Public Domain',
			license: 'Public Domain',
			licenseUrl: 'https://ebible.org/legal.php',
			source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
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

describe('TranslationSelector', () => {
	it('shows the current translation and opens the available choices', async () => {
		render(TranslationSelector, {
			translations,
			selectedTranslationId: 'engwebp',
			onSelect: () => true
		});

		const trigger = page.getByRole('button', {
			name: 'Current translation: World English Bible'
		});

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(trigger);

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

		await expect
			.element(
				page.getByRole('button', {
					name: 'World English Bible',
					exact: true
				})
			)
			.toHaveAttribute('aria-current', 'true');

		await expect
			.element(
				page.getByRole('button', {
					name: 'Uwspółcześniona Biblia Gdańska',
					exact: true
				})
			)
			.toBeVisible();
	});

	it('reports a selected translation and closes the choices', async () => {
		let selectedTranslationId: string | null = null;

		render(TranslationSelector, {
			translations,
			selectedTranslationId: 'engwebp',
			onSelect(translationId: string) {
				selectedTranslationId = translationId;
				return true;
			}
		});

		const trigger = page.getByRole('button', {
			name: 'Current translation: World English Bible'
		});

		await userEvent.click(trigger);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Uwspółcześniona Biblia Gdańska',
				exact: true
			})
		);

		expect(selectedTranslationId).toBe('polubg');
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('stays open and reports an error when selection fails', async () => {
		render(TranslationSelector, {
			translations,
			selectedTranslationId: 'engwebp',
			onSelect: () => false
		});

		const trigger = page.getByRole('button', {
			name: 'Current translation: World English Bible'
		});

		await userEvent.click(trigger);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Uwspółcześniona Biblia Gdańska',
				exact: true
			})
		);

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not load the selected translation.');
	});
});
