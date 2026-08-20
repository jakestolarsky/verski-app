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

	it('reports when the collapsed search should be expanded', async () => {
		let expandCalls = 0;

		render(ReferenceSearchForm, {
			value: 'John 3:16',
			collapsed: true,
			onSubmit() {},
			onClear() {},
			onExpand() {
				expandCalls += 1;
			}
		});

		await expect.element(page.getByLabelText('Bible reference')).not.toBeInTheDocument();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Search Bible'
			})
		);

		expect(expandCalls).toBe(1);
	});

	it('prevents repeated submissions while a lookup is pending', async () => {
		let submitCalls = 0;
		let finishSubmit = () => {};

		const pendingSubmit = new Promise<void>((resolve) => {
			finishSubmit = resolve;
		});

		render(ReferenceSearchForm, {
			value: '',
			async onSubmit() {
				submitCalls += 1;
				await pendingSubmit;
			},
			onClear() {}
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.fill(input, 'John 3:16');
		await userEvent.keyboard('{Enter}{Enter}');

		expect(submitCalls).toBe(1);

		await expect
			.element(
				page.getByRole('button', {
					name: 'Searching Bible'
				})
			)
			.toBeDisabled();

		await expect.element(page.getByText('Looking up passage…')).toBeInTheDocument();

		finishSubmit();

		await expect
			.element(
				page.getByRole('button', {
					name: 'Search Bible'
				})
			)
			.not.toBeDisabled();
	});

	it('hides the animated hint while the input is focused', async () => {
		render(ReferenceSearchForm, {
			value: '',
			onSubmit() {},
			onClear() {}
		});

		const input = page.getByLabelText('Bible reference');

		await userEvent.click(input);

		await expect.element(input).toHaveAttribute('placeholder', '');

		expect(document.querySelector('.typewriter-placeholder')).toBeNull();
	});
});
