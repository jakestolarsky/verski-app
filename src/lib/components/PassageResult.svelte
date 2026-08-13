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
		parseResult: ParseReferenceResult | null;
		lookupResult: LookupPassageResult | null;
		copyStatus: CopyStatus;
		onCopy: () => void | Promise<void>;
	};

	let { heading, parseResult, lookupResult, copyStatus, readingSettings, onCopy }: Props = $props();

	const errorMessages: Record<ParseReferenceError, string> = {
		'invalid-format': 'Enter a reference such as John 3:16.',
		'invalid-structure': 'Chapter and verse numbers must be positive whole numbers.',
		'unknown-book': 'That Bible book is not available.',
		'invalid-verse-range': 'The ending verse cannot come before the starting verse.',
		'ambiguous-book':
			'That abbreviation matches more than one Bible book. Enter a longer book name.'
	};
</script>

<section aria-labelledby="passage-heading" aria-live="polite">
	<h2 id="passage-heading">{heading}</h2>

	{#if parseResult === null}
		<p>Enter a Bible reference to begin.</p>
	{:else if !parseResult.ok}
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

					<span>{verse.text}</span>&#32;
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
</section>

<style>
	.passage-text {
		font-size: var(--verski-reading-size-default);
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
