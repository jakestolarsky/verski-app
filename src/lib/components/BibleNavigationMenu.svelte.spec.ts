import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { BibleNavigationTestament } from '$lib/application/build-bible-navigation';
import BibleNavigationMenu from './BibleNavigationMenu.svelte';

const navigation: BibleNavigationTestament[] = [
	{
		id: 'old',
		name: 'Old Testament',
		books: [
			{
				id: 'genesis',
				name: 'Genesis',
				chapters: [1, 2]
			}
		]
	},
	{
		id: 'new',
		name: 'New Testament',
		books: [
			{
				id: 'john',
				name: 'John',
				chapters: [1, 2, 3]
			}
		]
	}
];

describe('BibleNavigationMenu', () => {
	it('opens an accessible navigation dialog', async () => {
		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			onChapterSelect: () => true
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Bible navigation'
				})
			)
			.toBeVisible();

		await expect
			.element(page.getByRole('button', { name: 'Old Testament' }))
			.toHaveAttribute('aria-expanded', 'false');

		await expect
			.element(page.getByRole('button', { name: 'New Testament' }))
			.toHaveAttribute('aria-expanded', 'false');

		await expect.element(page.getByText('World English Bible')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Old Testament' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'New Testament' })).toBeVisible();
	});

	it('filters books by name', async () => {
		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			onChapterSelect: () => true
		});

		await userEvent.click(page.getByRole('button', { name: 'Open Bible navigation' }));
		await userEvent.fill(page.getByLabelText('Find a book'), 'john');

		await expect.element(page.getByRole('button', { name: 'John' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Genesis' })).not.toBeInTheDocument();
	});

	it('reports the selected chapter and closes after a successful selection', async () => {
		let selection: { bookId: string; chapter: number } | null = null;

		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			onChapterSelect(bookId: string, chapter: number) {
				selection = { bookId, chapter };
				return true;
			}
		});

		await userEvent.click(page.getByRole('button', { name: 'Open Bible navigation' }));
		await userEvent.click(
			page.getByRole('button', {
				name: 'Old Testament'
			})
		);
		await userEvent.click(page.getByRole('button', { name: 'Genesis' }));
		await userEvent.click(page.getByRole('button', { name: 'Genesis 2' }));

		expect(selection).toEqual({
			bookId: 'genesis',
			chapter: 2
		});

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Bible navigation',
					includeHidden: true
				})
			)
			.not.toBeVisible();
	});

	it('stays open when the chapter cannot be selected', async () => {
		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			onChapterSelect: () => false
		});

		await userEvent.click(page.getByRole('button', { name: 'Open Bible navigation' }));
		await userEvent.click(
			page.getByRole('button', {
				name: 'Old Testament'
			})
		);
		await userEvent.click(page.getByRole('button', { name: 'Genesis' }));
		await userEvent.click(page.getByRole('button', { name: 'Genesis 1' }));

		await expect
			.element(
				page.getByRole('dialog', {
					name: 'Bible navigation'
				})
			)
			.toBeVisible();

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Could not open the selected chapter.');
	});

	it('closes with Escape and returns focus to its trigger', async () => {
		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			onChapterSelect: () => true
		});

		const trigger = page.getByRole('button', {
			name: 'Open Bible navigation'
		});

		await userEvent.click(trigger);
		await userEvent.keyboard('{Escape}');

		await expect.element(trigger).toHaveFocus();
	});

	it('marks and expands the currently selected chapter', async () => {
		render(BibleNavigationMenu, {
			translationName: 'World English Bible',
			navigation,
			selectedBookId: 'john',
			selectedChapter: 2,
			onChapterSelect: () => true
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		await expect
			.element(
				page.getByRole('button', {
					name: 'John',
					exact: true
				})
			)
			.toHaveAttribute('aria-current', 'true');

		await expect
			.element(
				page.getByRole('button', {
					name: 'John 2',
					exact: true
				})
			)
			.toHaveAttribute('aria-current', 'page');
	});

	it('shows an empty state when the translation has no available books', async () => {
		render(BibleNavigationMenu, {
			translationName: 'Empty translation',
			navigation: [],
			onChapterSelect: () => true
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Open Bible navigation'
			})
		);

		await expect
			.element(page.getByText('No Bible books are available for this translation.'))
			.toBeVisible();
	});
});
