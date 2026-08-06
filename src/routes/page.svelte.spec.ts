import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('+page.svelte', () => {
	it('recognizes a valid reference submitted with Enter', async () => {
		render(Page);

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'J 3,16');
		await userEvent.keyboard('{Enter}');

		await expect
			.element(page.getByText(/Reference recognized/))
			.toBeInTheDocument();
	});

	it('shows a clear message for an invalid chapter', async () => {
		render(Page);

		const referenceInput = page.getByLabelText('Bible reference');

		await userEvent.fill(referenceInput, 'John 22');
		await userEvent.keyboard('{Enter}');

		await expect
			.element(
				page.getByText('That chapter does not exist in this Bible book.')
			)
			.toBeInTheDocument();
	});
});