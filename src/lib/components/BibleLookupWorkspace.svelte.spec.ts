import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { TranslationPackage } from '$lib/domain/translation-package';
import { StaticBibleRepository } from '$lib/storage/static-bible-repository';
import BibleLookupWorkspace from './BibleLookupWorkspace.svelte';
import { defaultUserSettings } from '$lib/domain/user-settings';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: 'test',
		attribution: 'World English Bible — Public Domain',
		license: 'Public Domain',
		licenseUrl: 'https://example.com/license',
		source: 'https://example.com',
		sourceChecksum: 'sha256:test',
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	chapters: [
		{
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: ['First verse.', 'Second verse.', 'Third verse.']
		}
	]
} satisfies TranslationPackage;

describe('BibleLookupWorkspace', () => {
	it('looks up a passage and makes it available in recent history', async () => {
		const repository = new StaticBibleRepository(translationPackage);

		render(BibleLookupWorkspace, {
			repository,
			translationId: translationPackage.manifest.id,
			translationName: translationPackage.manifest.name,
			recentLookups: [],
			recentLookupStore: null,
			readingSettings: defaultUserSettings.reading
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.fill(input, 'J 1:2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();

		await expect
			.element(
				page.getByRole('heading', {
					name: 'John 1:2'
				})
			)
			.toBeInTheDocument();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Show rest of chapter'
			})
		);

		await expect.element(page.getByText('Third verse.')).toBeInTheDocument();

		await expect
			.element(
				page.getByRole('heading', {
					name: 'John 1:2-3'
				})
			)
			.toBeInTheDocument();

		await expect
			.element(
				page.getByRole('button', {
					name: 'Show rest of chapter'
				})
			)
			.not.toBeInTheDocument();

		await expect.element(input).not.toBeVisible();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Search Bible'
			})
		);
		await expect.element(page.getByText('(World English Bible)')).toBeInTheDocument();

		await expect.element(input).toHaveFocus();
		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		await expect
			.element(
				page.getByRole('button', {
					name: 'John 1:2',
					exact: true
				})
			)
			.toBeInTheDocument();
	});

	it('shows recent lookups only for the active translation', async () => {
		const repository = new StaticBibleRepository(translationPackage);

		render(BibleLookupWorkspace, {
			repository,
			translationId: 'engwebp',
			translationName: 'World English Bible',
			recentLookups: [
				{
					translationId: 'engwebp',
					reference: {
						bookId: 'john',
						chapter: 1,
						verseStart: 1
					},
					searchedAt: 2
				},
				{
					translationId: 'polubg',
					reference: {
						bookId: 'john',
						chapter: 1,
						verseStart: 2
					},
					searchedAt: 1
				}
			],
			recentLookupStore: null,
			readingSettings: defaultUserSettings.reading
		});

		await expect.element(page.getByRole('button', { name: 'John 1:1', exact: true })).toBeVisible();

		await expect
			.element(page.getByRole('button', { name: 'John 1:2', exact: true }))
			.not.toBeInTheDocument();
	});
});
