import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import type { RecentLookup } from '$lib/domain/recent-lookup';
import RecentLookupList from './RecentLookupList.svelte';

const lookup = {
	translationId: 'engwebp',
	reference: {
		bookId: 'john',
		chapter: 3,
		verseStart: 16,
		verseEnd: 18
	},
	searchedAt: 1
} satisfies RecentLookup;

describe('RecentLookupList', () => {
	it('renders a formatted reference and reports the selected lookup', async () => {
		let selectedLookup: RecentLookup | null = null;

		render(RecentLookupList, {
			lookups: [lookup],
			onSelect(selected: RecentLookup) {
				selectedLookup = selected;
			},
			onClear() {}
		});

		const lookupButton = page.getByRole('button', {
			name: 'John 3:16-18'
		});

		await expect.element(lookupButton).toBeInTheDocument();

		await userEvent.click(lookupButton);

		expect(selectedLookup).toEqual(lookup);
	});

	it('reports when the user clears the history', async () => {
		let clearCalls = 0;

		render(RecentLookupList, {
			lookups: [lookup],
			onSelect() {},
			onClear() {
				clearCalls += 1;
			}
		});

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear history'
			})
		);

		expect(clearCalls).toBe(1);
	});
});
