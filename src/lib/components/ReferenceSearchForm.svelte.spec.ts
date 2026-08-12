import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ReferenceSearchForm from './ReferenceSearchForm.svelte';

describe('ReferenceSearchForm', () => {
	it('reports the entered reference on submit', async () => {
		let submittedValue = '';

		render(ReferenceSearchForm, {
			value: '',
			onSubmit(value: string) {
				submittedValue = value;
			},
			onClear() {}
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.fill(input, 'John 3:16');
		await userEvent.keyboard('{Enter}');

		expect(submittedValue).toBe('John 3:16');
	});

	it('clears the input and returns focus', async () => {
		let clearCalls = 0;

		render(ReferenceSearchForm, {
			value: 'John 3:16',
			onSubmit() {},
			onClear() {
				clearCalls += 1;
			}
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.click(
			page.getByRole('button', {
				name: 'Clear'
			})
		);

		await expect.element(input).toHaveValue('');
		await expect.element(input).toHaveFocus();
		expect(clearCalls).toBe(1);
	});

	it('clears the input with Escape', async () => {
		let clearCalls = 0;

		render(ReferenceSearchForm, {
			value: '',
			onSubmit() {},
			onClear() {
				clearCalls += 1;
			}
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.fill(input, 'John 3:16');
		await userEvent.keyboard('{Escape}');

		await expect.element(input).toHaveValue('');
		await expect.element(input).toHaveFocus();
		expect(clearCalls).toBe(1);
	});
});