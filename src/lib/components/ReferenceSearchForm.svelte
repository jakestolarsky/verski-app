<script lang="ts">
	import { createTypewriterPlaceholder } from './typewriter-placeholder.svelte';

	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';

	type Props = {
		value: string;
		collapsed?: boolean;
		onSubmit: (value: string) => void | Promise<void>;
		onClear: () => void;
		onExpand?: () => void | Promise<void>;
	};

	let {
		value = $bindable(),
		collapsed = false,
		onSubmit,
		onClear,
		onExpand = () => {}
	}: Props = $props();

	let inputElement = $state<HTMLInputElement>();
	let isSubmitting = $state(false);

	//typewriter animation effect
	const referenceExamples = ['J 3:16', 'Psalm 23', '1 Kor 13:4-7', 'Hi 1:1'] as const;
	let isInputFocused = $state(false);

	const typewriterPlaceholder = createTypewriterPlaceholder({
		examples: referenceExamples,
		isPaused: () => isInputFocused || collapsed || value !== ''
	});

	export function focus() {
		inputElement?.focus();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (isSubmitting) {
			return;
		}

		isSubmitting = true;

		try {
			await onSubmit(value);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClear() {
		if (isSubmitting) {
			return;
		}

		value = '';
		onClear();
		focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		handleClear();
	}
</script>

{#if collapsed}
	<button
		class="reference-search-trigger verski-round-action"
		type="button"
		aria-label="Search Bible"
		onclick={onExpand}
	>
		<SearchIcon aria-hidden="true" />
	</button>
{:else}
	<form onsubmit={handleSubmit}>
		<label class="visually-hidden" for="reference">Bible reference</label>

		<div class="reference-search">
			<input
				id="reference"
				name="reference"
				type="search"
				placeholder=""
				autocomplete="off"
				readonly={isSubmitting}
				bind:this={inputElement}
				bind:value
				onkeydown={handleKeydown}
				onfocus={() => {
					isInputFocused = true;
				}}
				onblur={() => {
					isInputFocused = false;
				}}
			/>

			{#if !isInputFocused && value === ''}
				<span class="typewriter-placeholder" aria-hidden="true">
					<span class="typewriter-placeholder__text">
						{typewriterPlaceholder.value}
					</span>

					<span
						class="typewriter-placeholder__cursor"
						class:blinking={typewriterPlaceholder.isCursorBlinking}
					></span>
				</span>
			{/if}

			{#if value}
				<button
					class="reference-search__clear"
					type="button"
					aria-label="Clear"
					disabled={isSubmitting}
					onclick={handleClear}
				>
					<XIcon aria-hidden="true" />
				</button>
			{/if}
		</div>

		<button
			class="reference-search__submit verski-round-action"
			type="submit"
			aria-label={isSubmitting ? 'Searching Bible' : 'Search Bible'}
			aria-busy={isSubmitting}
			disabled={isSubmitting}
		>
			{#if !isSubmitting}
				<SearchIcon aria-hidden="true" />
			{/if}
		</button>

		{#if isSubmitting}
			<span class="visually-hidden" role="status">Looking up passage…</span>
		{/if}
	</form>
{/if}

<style>
	form {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
		gap: 0.75rem;
		width: 100%;
		max-width: 32rem;
		margin-inline: auto;
	}

	.reference-search {
		position: relative;
		margin-bottom: 0;
		padding: 0.125rem;
		border-radius: var(--verski-input-radius);
		background: var(--verski-input-border);
		transition: box-shadow var(--pico-transition);
	}

	.reference-search:focus-within {
		background: var(--verski-input-border-gradient);
		box-shadow: 0 0 0 0.1875rem var(--verski-input-focus-ring);
	}

	.reference-search input {
		appearance: none;
		margin: 0;
		padding-inline-end: 2.25rem;
		padding-inline-start: 1.25rem;
		border: 0;
		border-radius: calc(var(--verski-input-radius) - 0.125rem);
		background: var(--verski-input-background);
		box-shadow: none;
		color: var(--verski-input-text);
		caret-color: var(--verski-primary);
		transition: color var(--pico-transition);
		-webkit-appearance: none;
	}

	.reference-search input:focus {
		outline: none;
		border: 0;
		background: var(--verski-input-background);
		box-shadow: none;
	}

	.reference-search input::placeholder {
		color: var(--verski-input-placeholder);
		opacity: 1;
	}

	button.reference-search__clear {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-end: 0.25rem;
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		padding: 0;
		transform: translateY(-50%);
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		box-shadow: none;
		color: var(--verski-input-text);
	}

	button.reference-search__clear:hover {
		background: var(--verski-state-hover-background);
	}

	button.reference-search__clear:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: -2px;
	}

	button.reference-search-trigger {
		margin-inline-start: auto;
	}

	button.reference-search__clear :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.reference-search input::-webkit-search-cancel-button {
		appearance: none;
	}

	.typewriter-placeholder {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: 1.375rem;
		z-index: 1;
		display: flex;
		align-items: center;
		max-width: calc(100% - 4rem);
		transform: translateY(-50%);
		overflow: hidden;
		color: var(--verski-input-placeholder);
		line-height: 1;
		white-space: nowrap;
		pointer-events: none;
	}

	.typewriter-placeholder__cursor {
		display: inline-block;
		width: 0.1rem;
		height: 1.1em;
		margin-inline-start: 0.125rem;
		flex: 0 0 auto;
		background: var(--verski-input-placeholder);
		opacity: 1;
	}

	.typewriter-placeholder__cursor.blinking {
		animation: typewriter-cursor-blink 900ms steps(1, end) infinite;
	}

	@keyframes typewriter-cursor-blink {
		0%,
		45% {
			opacity: 1;
		}

		46%,
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.typewriter-placeholder__cursor.blinking {
			animation: none;
			opacity: 1;
		}
	}
</style>
