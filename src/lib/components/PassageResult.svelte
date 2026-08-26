<script lang="ts">
	import type { LookupPassageResult } from '$lib/application/lookup-passage';
	import type { ParseReferenceResult } from '$lib/domain/parser/parse-reference';
	import type { ReadingSettings } from '$lib/domain/user-settings';
	import * as m from '$lib/paraglide/messages.js';

	/*icons*/
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClipboardCopyIcon from '@lucide/svelte/icons/clipboard-copy';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	type CopyStatus = 'idle' | 'copied' | 'error';

	type Props = {
		readingSettings: ReadingSettings;
		heading: string;
		translationName: string;
		parseResult: ParseReferenceResult | null;
		lookupResult: LookupPassageResult | null;
		copyStatus: CopyStatus;
		onCopy: () => void | Promise<void>;
		onShowChapterRemainder: () => void | Promise<void>;
	};

	let {
		heading,
		translationName,
		parseResult,
		lookupResult,
		copyStatus,
		readingSettings,
		onCopy,
		onShowChapterRemainder
	}: Props = $props();
</script>

<section
	aria-labelledby={parseResult?.ok && (lookupResult === null || lookupResult.ok)
		? 'passage-heading'
		: undefined}
	aria-live="polite"
>
	{#if parseResult?.ok && (lookupResult === null || lookupResult.ok)}
		<h2 id="passage-heading" class="passage-heading">{heading}</h2>

		{#if lookupResult?.ok}
			<p class="translation-name">({translationName})</p>
		{/if}

		{#if lookupResult === null}
			<p>{m.passage_loading()}</p>
		{:else}
			<p
				class="passage-text"
				data-font-size={readingSettings.fontSize}
				data-line-height={readingSettings.lineHeight}
			>
				{#each lookupResult.passage.verses as verse (verse.number)}
					<span>
						{#if readingSettings.showVerseNumbers}
							<sup>{verse.number}</sup>
						{/if}

						<span>{verse.text}{' '}</span>&#32;
					</span>
				{/each}
			</p>

			<button
				class="copy-button"
				type="button"
				aria-label={copyStatus === 'copied' ? m.passage_copy_again_label() : m.passage_copy_label()}
				onclick={onCopy}
			>
				<span
					class="copy-button__icon"
					class:confirmed={copyStatus === 'copied'}
					aria-hidden="true"
				>
					{#if copyStatus === 'copied'}
						<CheckIcon />
					{:else}
						<ClipboardCopyIcon />
					{/if}
				</span>
			</button>

			{#if copyStatus === 'copied'}
				<p class="copy-status" role="status">
					{m.passage_copied_status()}
				</p>
			{:else if copyStatus === 'error'}
				<p class="copy-status" role="alert">
					{m.passage_copy_error()}
				</p>
			{/if}

			{#if lookupResult.hasMoreVerses}
				<button
					class="chapter-remainder-button"
					type="button"
					aria-label={m.passage_show_chapter_remainder()}
					onclick={onShowChapterRemainder}
				>
					<ChevronDownIcon aria-hidden="true" />
				</button>
			{/if}
		{/if}
	{/if}
</section>

<style>
	.passage-heading {
		margin-bottom: 0.125rem;
		font-family: var(--verski-font-display);
		font-size: clamp(2.25rem, 8vw, 3.5rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.1;
	}

	.translation-name {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-family: var(--verski-font-display);
		font-size: clamp(1rem, 3vw, 1.5rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.3;
	}

	.passage-text {
		font-family: var(--verski-font-reading);
		font-size: var(--verski-reading-size-default);
		font-weight: var(--verski-font-weight-regular);
		line-height: var(--verski-reading-line-height-default);
		margin-bottom: 0;
	}

	.passage-text[data-font-size='small'] {
		font-size: var(--verski-reading-size-small);
	}

	.passage-text[data-font-size='large'] {
		font-size: var(--verski-reading-size-large);
	}

	.passage-text[data-line-height='compact'] {
		line-height: var(--verski-reading-line-height-compact);
	}

	.passage-text[data-line-height='relaxed'] {
		line-height: var(--verski-reading-line-height-relaxed);
	}

	.passage-text sup {
		margin-inline-end: 0.25em;
	}

	button.copy-button {
		display: grid;
		width: 3rem;
		min-width: 3rem;
		height: 3rem;
		margin-block: 0;
		margin-inline-start: auto;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
	}

	button.copy-button:hover {
		background: var(--verski-state-hover-background);
		color: var(--verski-primary);
	}

	button.copy-button:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	.copy-button__icon {
		display: grid;
		place-items: center;
	}

	.copy-button__icon :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
		animation: copy-confirmation 180ms ease-out;
	}

	.copy-button__icon.confirmed {
		color: var(--verski-primary);
		animation: copy-confirmation 180ms ease-out;
	}

	@keyframes copy-confirmation {
		from {
			opacity: 0;
			transform: scale(0.7);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-button__icon,
		.copy-button__icon :global(svg),
		.copy-button__icon.confirmed {
			animation: none;
		}
	}

	.copy-status {
		margin-block: 0.5rem 0;
		text-align: end;
	}

	button.chapter-remainder-button {
		display: grid;
		width: 3.5rem;
		min-width: 3.5rem;
		height: 3.5rem;
		margin: 1.5rem auto 0;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
	}

	button.chapter-remainder-button:hover {
		background: var(--verski-state-hover-background);
		color: var(--verski-primary);
	}

	button.chapter-remainder-button:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	button.chapter-remainder-button :global(svg) {
		width: 2.25rem;
		height: 2.25rem;
	}
</style>
