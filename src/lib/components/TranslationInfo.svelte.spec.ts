import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { TranslationManifest } from '$lib/domain/translation-package';
import TranslationInfo from './TranslationInfo.svelte';

const manifest = {
	id: 'polubg',
	name: 'Uwspółcześniona Biblia Gdańska',
	language: 'pl-PL',
	version: '2025-12-12',
	attribution: '© 2018 Fundacja Wrota Nadziei',
	license: 'CC BY-ND 4.0',
	licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
	source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
	sourceChecksum: 'sha256:15260b7b551446def9e253cd1ce1ef145bbfcdb9d172f4cf6f9f671d21f2c2cf',
	schemaVersion: 1,
	canonId: 'protestant-66',
	bookIds: ['john']
} satisfies TranslationManifest;

describe('TranslationInfo', () => {
	it('shows translation attribution, license and source', async () => {
		render(TranslationInfo, { manifest });

		await expect.element(page.getByRole('region', { name: 'Current translation' })).toBeVisible();

		await expect.element(page.getByText(manifest.name)).toBeVisible();
		await expect.element(page.getByText(manifest.attribution)).toBeVisible();
		await expect.element(page.getByText(manifest.version)).toBeVisible();

		await expect
			.element(page.getByRole('link', { name: manifest.license }))
			.toHaveAttribute('href', manifest.licenseUrl);

		await expect
			.element(page.getByRole('link', { name: 'Official source' }))
			.toHaveAttribute('href', manifest.source);
	});
});
