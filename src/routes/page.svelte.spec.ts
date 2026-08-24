import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TranslationPackage } from '$lib/domain/translation-package';
import Page from './+page.svelte';
import type { RecentLookup } from '$lib/domain/recent-lookup';
import { IndexedDbRecentLookupStore } from '$lib/storage/indexed-db/indexed-db-recent-lookup-store';
import { openBibleDatabase } from '$lib/storage/indexed-db/open-bible-database';
import type { TranslationCatalog } from '$lib/domain/translation-catalog';
import { IndexedDbUserSettingsStore } from '$lib/storage/indexed-db/indexed-db-user-settings-store';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
		attribution: 'World English Bible — Public Domain',
		license: 'Public Domain',
		licenseUrl: 'https://ebible.org/legal.php',
		source: 'https://ebible.org/bible/details.php?all=1&id=engwebp',
		sourceChecksum: 'sha256:4ea4c923cd292be353a3fc3fdf6aae75b385a8823dc9834129c20ff53f8caa70',
		schemaVersion: 1,
		canonId: 'protestant-66',
		bookIds: ['john']
	},
	chapters: [
		{
			translationId: 'engwebp',
			bookId: 'john',
			chapter: 1,
			verses: ['First verse.', 'Second verse.']
		}
	]
} satisfies TranslationPackage;

const polishTranslationPackage = {
	manifest: {
		...translationPackage.manifest,
		id: 'polubg',
		name: 'Uwspółcześniona Biblia Gdańska',
		language: 'pl-PL',
		version: '2025-12-12',
		attribution: '© 2018 Fundacja Wrota Nadziei',
		license: 'CC BY-ND 4.0',
		licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
		source: 'https://ebible.org/bible/details.php?all=1&id=polubg',
		sourceChecksum: `sha256:${'b'.repeat(64)}`
	},
	chapters: [
		{
			translationId: 'polubg',
			bookId: 'john',
			chapter: 1,
			verses: ['Na początku było Słowo.', 'Ono było na początku u Boga.']
		}
	]
} satisfies TranslationPackage;

const translationCatalog = {
	defaultTranslationId: translationPackage.manifest.id,
	translations: [
		{
			manifest: translationPackage.manifest,
			packageUrl: '/translations/engwebp.json'
		},
		{
			manifest: polishTranslationPackage.manifest,
			packageUrl: '/translations/polubg.json'
		}
	]
} satisfies TranslationCatalog;

const data = {
	translationCatalog,
	translationPackage
};

function deleteBibleDatabase(): Promise<void> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase('verski-bible');

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(request.error ?? new Error('Failed to delete the test database'));
		};
	});
}

beforeEach(async () => {
	await deleteBibleDatabase();
});

async function expandSearch(): Promise<void> {
	await userEvent.click(
		page.getByRole('button', {
			name: 'Search Bible'
		})
	);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('+page.svelte', () => {
	it('looks up a valid reference submitted with Enter', async () => {
		render(Page, { data });

		const tagline = page.getByText('Bible lookup done right');
		await expect.element(tagline).toBeVisible();

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'J 1,2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		await expect
			.element(
				page.getByRole('heading', {
					name: 'John 1:2'
				})
			)
			.toBeInTheDocument();
		await expect
			.element(
				page.getByRole('button', {
					name: 'Copy passage'
				})
			)
			.toBeInTheDocument();

		await expect.element(tagline).not.toBeInTheDocument();
	});

	it('shows a clear message when a chapter is unavailable in the translation', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 22');
		await userEvent.keyboard('{Enter}');

		await expect
			.element(page.getByText('This chapter is not available in the selected translation.'))
			.toBeInTheDocument();
	});

	it('clears the current lookup and returns focus to the input', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 1:1');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('First verse.')).toBeInTheDocument();

		await expandSearch();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		await expect.element(referenceInput).toHaveValue('');
		await expect.element(page.getByText('First verse.')).not.toBeInTheDocument();
		await expect
			.element(page.getByText('Enter a Bible reference to begin.'))
			.not.toBeInTheDocument();
		await expect.element(referenceInput).toHaveFocus();
	});

	it('clears the current lookup with Escape', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 1:1');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('First verse.')).toBeInTheDocument();

		await expandSearch();

		await userEvent.keyboard('{Escape}');

		await expect.element(referenceInput).toHaveValue('');
		await expect.element(page.getByText('First verse.')).not.toBeInTheDocument();
		await expect
			.element(page.getByText('Enter a Bible reference to begin.'))
			.not.toBeInTheDocument();
		await expect.element(referenceInput).toHaveFocus();
	});

	it('reopens a successful lookup from recent history', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'J 1,2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		await expandSearch();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		const recentLookupButton = page.getByRole('button', {
			name: 'John 1:2',
			exact: true
		});

		await expect.element(recentLookupButton).toBeInTheDocument();

		await userEvent.click(recentLookupButton);

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		await expect.element(referenceInput).not.toBeVisible();

		await expandSearch();

		await expect.element(referenceInput).toHaveValue('John 1:2');
		await expect.element(referenceInput).toHaveFocus();
	});

	it('does not add an unsuccessful lookup to recent history', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 22');
		await userEvent.keyboard('{Enter}');

		await expect
			.element(page.getByText('This chapter is not available in the selected translation.'))
			.toBeInTheDocument();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		await expect
			.element(
				page.getByRole('heading', {
					name: 'Recent lookups'
				})
			)
			.not.toBeInTheDocument();
	});

	it('clears recent history', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 1:1');
		await userEvent.keyboard('{Enter}');

		await expandSearch();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		const recentLookupButton = page.getByRole('button', {
			name: 'John 1:1',
			exact: true
		});

		await expect.element(recentLookupButton).toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Settings' }));
		await userEvent.click(page.getByRole('tab', { name: 'System' }));

		const clearHistoryButton = page.getByRole('button', {
			name: 'Clear history'
		});

		await expect.element(clearHistoryButton).toBeEnabled();

		await userEvent.click(clearHistoryButton);

		await expect.element(clearHistoryButton).toBeDisabled();
		await expect.element(recentLookupButton).not.toBeInTheDocument();
		await expect.element(page.getByText('There are no recent lookups to remove.')).toBeVisible();
	});

	it('restores recent lookups from IndexedDB after remounting', async () => {
		const storedLookup = {
			translationId: 'engwebp',
			reference: {
				bookId: 'john',
				chapter: 1,
				verseStart: 1
			},
			searchedAt: 1
		} satisfies RecentLookup;

		const database = await openBibleDatabase();
		const historyStore = new IndexedDbRecentLookupStore(database);

		await historyStore.replaceRecentLookups([storedLookup]);

		database.close();

		const firstRender = render(Page, { data });

		await expect
			.element(
				page.getByRole('button', {
					name: 'John 1:1',
					exact: true
				})
			)
			.toBeInTheDocument();

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 1:2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		await expandSearch();
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

		await firstRender.unmount();

		render(Page, { data });

		await expect
			.element(
				page.getByRole('button', {
					name: 'John 1:2',
					exact: true
				})
			)
			.toBeInTheDocument();
	});

	it('applies and restores reading settings from IndexedDB', async () => {
		const firstRender = render(Page, { data });

		const settingsButton = page.getByRole('button', {
			name: 'Settings'
		});

		await expect.element(settingsButton).toBeEnabled();
		await userEvent.click(settingsButton);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Increase text size'
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Increase line spacing'
			})
		);

		await userEvent.click(
			page.getByRole('checkbox', {
				name: 'Show verse numbers'
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Close settings'
			})
		);

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 1:2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();

		const firstPassageText = page.getByText('Second verse.').element().closest('.passage-text');

		expect(firstPassageText?.getAttribute('data-font-size')).toBe('large');
		expect(firstPassageText?.getAttribute('data-line-height')).toBe('relaxed');
		expect(firstPassageText?.querySelector('sup')).toBeNull();

		await firstRender.unmount();

		render(Page, { data });

		await expect.element(settingsButton).toBeEnabled();

		const restoredReferenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(restoredReferenceInput, 'John 1:2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();

		const restoredPassageText = page.getByText('Second verse.').element().closest('.passage-text');

		expect(restoredPassageText?.getAttribute('data-font-size')).toBe('large');
		expect(restoredPassageText?.getAttribute('data-line-height')).toBe('relaxed');
		expect(restoredPassageText?.querySelector('sup')).toBeNull();
	});

	it('opens a full chapter selected from Bible navigation', async () => {
		render(Page, { data });

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);
		await userEvent.click(
			page.getByRole('button', {
				name: 'New Testament'
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'John',
				exact: true
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'John 1'
			})
		);

		const referenceInput = page.getByLabelText('Bible reference');

		await expect.element(referenceInput).not.toBeVisible();

		await expandSearch();

		await expect.element(referenceInput).toHaveValue('John 1');
		await expect.element(referenceInput).toHaveFocus();
		await expect
			.element(
				page.getByRole('heading', {
					name: 'John 1'
				})
			)
			.toBeInTheDocument();

		await expect.element(page.getByText('First verse.')).toBeInTheDocument();
		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Bible navigation',
					includeHidden: true
				})
			)
			.not.toBeVisible();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		await expect
			.element(page.getByRole('button', { name: 'John', exact: true }))
			.toHaveAttribute('aria-current', 'true');

		await expect
			.element(page.getByRole('button', { name: 'John 1', exact: true }))
			.toHaveAttribute('aria-current', 'page');
	});

	it('uses the bundled translation when offline storage cannot be prepared', async () => {
		const openDatabase = vi.spyOn(indexedDB, 'open').mockImplementation(() => {
			throw new Error('Simulated IndexedDB failure');
		});

		try {
			render(Page, { data });

			const storageMessage = page.getByText(
				'Offline storage could not be restored. The bundled translation is still available, but recent lookups and settings may not be saved.'
			);

			await expect.element(storageMessage).toBeVisible();
			await expect.element(storageMessage).toHaveAttribute('role', 'status');

			const referenceInput = page.getByLabelText('Bible reference');

			await userEvent.fill(referenceInput, 'John 1:1');
			await userEvent.keyboard('{Enter}');

			await expect.element(page.getByText('First verse.')).toBeVisible();
		} finally {
			openDatabase.mockRestore();
		}
	});

	it('switches translation and restores it after remounting', async () => {
		const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(async (input) => {
			if (input.toString() === '/translations/polubg.json') {
				return Response.json(polishTranslationPackage);
			}

			return new Response(null, {
				status: 404
			});
		});

		const firstRender = render(Page, { data });

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		const currentWebTranslation = page.getByRole('button', {
			name: 'Current translation: World English Bible'
		});

		await expect.element(currentWebTranslation).toBeEnabled();

		await userEvent.click(currentWebTranslation);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Uwspółcześniona Biblia Gdańska',
				exact: true
			})
		);

		const currentPolishTranslation = page.getByRole('button', {
			name: 'Current translation: Uwspółcześniona Biblia Gdańska'
		});

		await expect.element(currentPolishTranslation).toBeVisible();

		await expect.element(currentPolishTranslation).toHaveAttribute('aria-expanded', 'false');

		expect(fetchMock).toHaveBeenCalledTimes(1);

		expect(fetchMock).toHaveBeenCalledWith('/translations/polubg.json');

		await userEvent.click(currentPolishTranslation);

		await userEvent.click(
			page.getByRole('button', {
				name: 'World English Bible',
				exact: true
			})
		);

		const restoredWebTranslation = page.getByRole('button', {
			name: 'Current translation: World English Bible'
		});

		await expect.element(restoredWebTranslation).toHaveAttribute('aria-expanded', 'false');

		expect(fetchMock).toHaveBeenCalledTimes(1);

		fetchMock.mockRejectedValue(new TypeError('Simulated offline state'));

		await userEvent.click(restoredWebTranslation);

		await userEvent.click(
			page.getByRole('button', {
				name: 'Uwspółcześniona Biblia Gdańska',
				exact: true
			})
		);

		await expect.element(currentPolishTranslation).toHaveAttribute('aria-expanded', 'false');

		expect(fetchMock).toHaveBeenCalledTimes(1);

		const settingsDatabase = await openBibleDatabase();
		const settingsStore = new IndexedDbUserSettingsStore(settingsDatabase);

		const storedSettings = await settingsStore.getStoredUserSettings();

		expect(storedSettings).toMatchObject({
			selectedTranslationId: 'polubg'
		});

		settingsDatabase.close();

		await userEvent.click(
			page.getByRole('button', {
				name: 'New Testament'
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'John',
				exact: true
			})
		);

		await userEvent.click(
			page.getByRole('button', {
				name: 'John 1'
			})
		);

		await expect.element(page.getByText('Na początku było Słowo.')).toBeVisible();

		await firstRender.unmount();

		render(Page, { data });

		await expect
			.element(
				page.getByRole('button', {
					name: 'Settings'
				})
			)
			.toBeEnabled();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		await expect
			.element(
				page.getByRole('button', {
					name: 'Current translation: Uwspółcześniona Biblia Gdańska'
				})
			)
			.toBeVisible();

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
