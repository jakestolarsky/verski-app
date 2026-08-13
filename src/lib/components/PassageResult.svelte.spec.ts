import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultUserSettings } from '$lib/domain/user-settings';

import type { LookupPassageResult } from '$lib/application/lookup-passage';
import type { ParseReferenceResult } from '$lib/domain/parser/parse-reference';
import PassageResult from './PassageResult.svelte';

describe('PassageResult', () => {
	it('shows instructions before the first lookup', async () => {
		render(PassageResult, {
			heading: 'Passage',
			parseResult: null,
			lookupResult: null,
			copyStatus: 'idle',
			readingSettings: defaultUserSettings.reading,
			onCopy() {}
		});

		await expect.element(page.getByText('Enter a Bible reference to begin.')).toBeInTheDocument();
	});

	it('shows a parser error', async () => {
		const parseResult = {
			ok: false,
			error: 'unknown-book'
		} satisfies ParseReferenceResult;

		render(PassageResult, {
			heading: 'Passage',
			parseResult,
			lookupResult: null,
			copyStatus: 'idle',
			readingSettings: defaultUserSettings.reading,
			onCopy() {}
		});

		await expect.element(page.getByText('That Bible book is not available.')).toBeInTheDocument();
	});

	it('renders a passage and reports the copy action', async () => {
		const parseResult = {
			ok: true,
			reference: {
				bookId: 'john',
				chapter: 1,
				verseStart: 2
			}
		} satisfies ParseReferenceResult;

		const lookupResult = {
			ok: true,
			passage: {
				translationId: 'engwebp',
				bookId: 'john',
				chapter: 1,
				verses: [
					{
						number: 2,
						text: 'Second verse.'
					}
				]
			}
		} satisfies LookupPassageResult;

		let copyCalls = 0;

		render(PassageResult, {
			heading: 'John 1:2 (World English Bible)',
			parseResult,
			lookupResult,
			copyStatus: 'copied',
			readingSettings: {
				fontSize: 'large',
				lineHeight: 'relaxed',
				showVerseNumbers: false
			},
			onCopy() {
				copyCalls += 1;
			}
		});

		await expect
			.element(
				page.getByRole('heading', {
					name: 'John 1:2 (World English Bible)'
				})
			)
			.toBeInTheDocument();

		await expect.element(page.getByText('Second verse.')).toBeInTheDocument();
		const passageText = page.getByText('Second verse.').element().closest('.passage-text');

		expect(passageText?.getAttribute('data-font-size')).toBe('large');
		expect(passageText?.getAttribute('data-line-height')).toBe('relaxed');

		await expect.element(page.getByText('2', { exact: true })).not.toBeInTheDocument();
		await expect.element(page.getByText('Passage copied.')).toBeInTheDocument();

		await userEvent.click(
			page.getByRole('button', {
				name: 'Copy passage'
			})
		);

		expect(copyCalls).toBe(1);
	});
});
