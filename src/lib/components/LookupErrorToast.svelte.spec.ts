import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LookupErrorToast from './LookupErrorToast.svelte';

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('LookupErrorToast', () => {
	it('shows a parser error and allows dismissing it', async () => {
		const onDismiss = vi.fn();

		render(LookupErrorToast, {
			parseResult: {
				ok: false,
				error: 'unknown-book'
			},
			lookupResult: null,
			onDismiss
		});

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('That Bible book is not available.');

		await userEvent.click(
			page.getByRole('button', {
				name: 'Dismiss error'
			})
		);

		expect(onDismiss).toHaveBeenCalledWith('manual');
	});

	it('dismisses the error automatically after five seconds', async () => {
		vi.useFakeTimers();

		const onDismiss = vi.fn();

		render(LookupErrorToast, {
			parseResult: {
				ok: false,
				error: 'unknown-book'
			},
			lookupResult: null,
			onDismiss
		});

		await vi.advanceTimersByTimeAsync(4999);

		expect(onDismiss).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);

		expect(onDismiss).toHaveBeenCalledWith('timeout');

		vi.useRealTimers();
	});
});
