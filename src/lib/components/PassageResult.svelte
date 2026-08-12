<script lang="ts">
	import type { LookupPassageResult } from '$lib/application/lookup-passage';
	import type {
		ParseReferenceError,
		ParseReferenceResult
	} from '$lib/domain/parser/parse-reference';

	type CopyStatus = 'idle' | 'copied' | 'error';

	type Props = {
		heading: string;
		parseResult: ParseReferenceResult | null;
		lookupResult: LookupPassageResult | null;
		copyStatus: CopyStatus;
		onCopy: () => void | Promise<void>;
	};

	let { heading, parseResult, lookupResult, copyStatus, onCopy }: Props = $props();

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
		<p>
			{#each lookupResult.passage.verses as verse (verse.number)}
				<span>
					<sup>{verse.number}</sup>
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
