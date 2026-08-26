<script lang="ts">
	import type { LookupPassageResult } from '$lib/application/lookup-passage';
	import type {
		ParseReferenceError,
		ParseReferenceResult
	} from '$lib/domain/parser/parse-reference';
	import * as m from '$lib/paraglide/messages.js';
	import XIcon from '@lucide/svelte/icons/x';

	type Props = {
		parseResult: ParseReferenceResult | null;
		lookupResult: LookupPassageResult | null;
		onDismiss: () => void | Promise<void>;
	};

	let { parseResult, lookupResult, onDismiss }: Props = $props();

	const parseErrorMessages = {
		'invalid-format': m.passage_error_invalid_format,
		'invalid-structure': m.passage_error_invalid_structure,
		'unknown-book': m.passage_error_unknown_book,
		'invalid-verse-range': m.passage_error_invalid_verse_range,
		'ambiguous-book': m.passage_error_ambiguous_book
	} satisfies Record<ParseReferenceError, () => string>;

	const message = $derived.by(() => {
		const currentParseResult = parseResult;

		if (currentParseResult !== null && !currentParseResult.ok) {
			return parseErrorMessages[currentParseResult.error]();
		}

		const currentLookupResult = lookupResult;

		if (currentLookupResult !== null && !currentLookupResult.ok) {
			return currentLookupResult.error === 'chapter-not-found'
				? m.passage_chapter_not_found()
				: m.passage_verse_not_found();
		}

		return null;
	});
</script>

{#if message !== null}
	<div class="lookup-error-toast" role="alert">
		<p>{message}</p>

		<button type="button" aria-label={m.lookup_error_dismiss_label()} onclick={onDismiss}>
			<XIcon aria-hidden="true" />
		</button>
	</div>
{/if}

<style>
	.lookup-error-toast {
		position: fixed;
		top: calc(env(safe-area-inset-top, 0px) + 4.5rem);
		left: 50%;
		z-index: var(--verski-layer-dialog);
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		width: min(calc(100% - 2rem), 36rem);
		padding: 0.75rem 0.75rem 0.75rem 1rem;
		border: 1px solid var(--verski-border-active);
		border-radius: var(--verski-input-radius);
		background: var(--verski-surface);
		color: var(--verski-text);
		transform: translateX(-50%);
	}

	.lookup-error-toast p {
		margin: 0;
	}

	.lookup-error-toast button {
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		background: transparent;
		color: currentColor;
	}

	.lookup-error-toast button:hover {
		background: var(--verski-state-hover-background);
		color: var(--verski-primary);
	}

	.lookup-error-toast button :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}
</style>
