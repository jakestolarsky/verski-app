import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AppUpdateNotice from './AppUpdateNotice.svelte';

describe('AppUpdateNotice', () => {
	it('shows a localized update notice and allows dismissing it', async () => {
		const onDismiss = vi.fn();

		render(AppUpdateNotice, {
			locale: 'pl',
			onDismiss
		});

		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('Dostępna jest nowa wersja Verski.');

		await userEvent.click(
			page.getByRole('button', {
				name: 'Zamknij powiadomienie o aktualizacji'
			})
		);

		expect(onDismiss).toHaveBeenCalledOnce();
	});
});
