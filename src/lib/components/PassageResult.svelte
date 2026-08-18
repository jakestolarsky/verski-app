<script lang="ts">
	import type { LookupPassageResult } from '$lib/application/lookup-passage';
	import type {
		ParseReferenceError,
		ParseReferenceResult
	} from '$lib/domain/parser/parse-reference';
	import type { ReadingSettings } from '$lib/domain/user-settings';

	type CopyStatus = 'idle' | 'copied' | 'error';

	type Props = {
		readingSettings: ReadingSettings;
		heading: string;
		translationName: string;
		parseResult: ParseReferenceResult | null;
		lookupResult: LookupPassageResult | null;
		copyStatus: CopyStatus;
		onCopy: () => void | Promise<void>;
	};

	let {
		heading,
		translationName,
		parseResult,
		lookupResult,
		copyStatus,
		readingSettings,
		onCopy
	}: Props = $props();

	const errorMessages: Record<ParseReferenceError, string> = {
		'invalid-format': 'Enter a reference such as John 3:16.',
		'invalid-structure': 'Chapter and verse numbers must be positive whole numbers.',
		'unknown-book': 'That Bible book is not available.',
		'invalid-verse-range': 'The ending verse cannot come before the starting verse.',
		'ambiguous-book':
			'That abbreviation matches more than one Bible book. Enter a longer book name.'
	};
</script>

<section aria-labelledby={parseResult === null ? undefined : 'passage-heading'} aria-live="polite">
	{#if parseResult !== null}
		<h2 id="passage-heading" class="passage-heading">{heading}</h2>

		{#if parseResult.ok && lookupResult?.ok}
			<p class="translation-name">({translationName})</p>
		{/if}

		{#if !parseResult.ok}
			<p>{errorMessages[parseResult.error]}</p>
		{:else if lookupResult === null}
			<p>Loading passage…</p>
		{:else if !lookupResult.ok}
			{#if lookupResult.error === 'chapter-not-found'}
				<p>This chapter is not available in the selected translation.</p>
			{:else}
				<p>That verse does not exist in this chapter.</p>
			{/if}
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

						<span>{verse.text}{" "}</span>&#32;
					</span>
				{/each}
			</p>

			<button type="button" onclick={onCopy}>Copy passage</button>

			{#if copyStatus === 'copied'}
				<p>Passage copied.</p>
			{:else if copyStatus === 'error'}
				<p>Passage could not be copied.</p>
			{/if}
		{/if}
	{/if}
</section>

<style>
	.passage-heading {
		margin-bottom: 0.125rem;
		font-family: var(--verski-font-display);
		font-size: clamp(3.5rem, 8vw, 3rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.1;
	}

	.translation-name {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-family: var(--verski-font-display);
		font-size: 1.5rem;
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.3;
	}

	.passage-text {
		font-family: var(--verski-font-reading);
		font-size: var(--verski-reading-size-default);
		font-weight: var(--verski-font-weight-regular);
		line-height: var(--verski-reading-line-height-default);
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
</style>
