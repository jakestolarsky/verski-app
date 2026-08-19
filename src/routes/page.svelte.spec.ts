import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TranslationPackage } from '$lib/domain/translation-package';
import Page from './+page.svelte';
import type { RecentLookup } from '$lib/domain/recent-lookup';
import { IndexedDbRecentLookupStore } from '$lib/storage/indexed-db/indexed-db-recent-lookup-store';
import { openBibleDatabase } from '$lib/storage/indexed-db/open-bible-database';

const translationPackage = {
	manifest: {
		id: 'engwebp',
		name: 'World English Bible',
		language: 'en-US',
		version: '2026-08-06',
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

const data = {
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
		await expect.element(referenceInput).not.toBeInTheDocument();

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

		await expect.element(referenceInput).not.toBeInTheDocument();

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
});
