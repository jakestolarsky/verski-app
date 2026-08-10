import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TranslationPackage } from '$lib/domain/translation-package';
import Page from './+page.svelte';

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

describe('+page.svelte', () => {
	it('looks up a valid reference submitted with Enter', async () => {
		render(Page, { data });

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'J 1,2');
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		await expect
			.element(
				page.getByRole('button', {
					name: 'Copy passage'
				})
			)
			.toBeInTheDocument();
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
});
