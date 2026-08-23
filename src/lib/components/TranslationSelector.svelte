<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	import type { TranslationCatalogEntry } from '$lib/domain/translation-catalog';

	type Props = {
		translations: readonly TranslationCatalogEntry[];
		selectedTranslationId: string;
		disabled?: boolean;
		onSelect: (translationId: string) => boolean | Promise<boolean>;
	};

	let { translations, selectedTranslationId, disabled = false, onSelect }: Props = $props();

	let expanded = $state(false);
	let isSelecting = $state(false);
	let selectionError = $state(false);

	const selectedTranslation = $derived(
		translations.find((entry) => entry.manifest.id === selectedTranslationId)
	);

	const selectedTranslationName = $derived(
		selectedTranslation?.manifest.name ?? 'Choose translation'
	);

	function toggleChoices() {
		selectionError = false;
		expanded = !expanded;
	}

	async function handleSelect(translationId: string) {
		selectionError = false;

		if (translationId === selectedTranslationId) {
			expanded = false;
			return;
		}

		isSelecting = true;

		let selected = false;

		try {
			selected = await onSelect(translationId);
		} catch {
			selected = false;
		}

		isSelecting = false;

		if (selected) {
			expanded = false;
			return;
		}

		selectionError = true;
	}
</script>

<div class="translation-selector">
	<button
		class="translation-selector__trigger"
		type="button"
		aria-label={`Current translation: ${selectedTranslationName}`}
		aria-expanded={expanded}
		aria-controls="translation-choices"
		disabled={disabled || translations.length === 0}
		onclick={toggleChoices}
	>
		<span>{selectedTranslationName}</span>

		<span
			class="translation-selector__icon"
			class:translation-selector__icon--expanded={expanded}
			aria-hidden="true"
		>
			<ChevronDownIcon />
		</span>
	</button>

	{#if expanded}
		<ul id="translation-choices" class="translation-selector__choices" role="list">
			{#each translations as translation (translation.manifest.id)}
				<li>
					<button
						class="translation-selector__choice"
						type="button"
						aria-current={translation.manifest.id === selectedTranslationId ? 'true' : undefined}
						disabled={isSelecting}
						onclick={() => handleSelect(translation.manifest.id)}
					>
						{translation.manifest.name}
					</button>
				</li>
			{/each}
		</ul>

		{#if isSelecting}
			<p class="translation-selector__status" role="status">Loading translation…</p>
		{/if}

		{#if selectionError}
			<p class="translation-selector__error" role="alert">
				Could not load the selected translation.
			</p>
		{/if}
	{/if}
</div>

<style>
	.translation-selector {
		margin-bottom: var(--pico-spacing);
	}

	.translation-selector__trigger {
		display: flex;
		width: 100%;
		margin: 0;
		padding: 0.5rem;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		font-family: var(--verski-font-display);
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1.2;
	}

	.translation-selector__trigger:hover {
		background: transparent;
		color: var(--verski-state-active-text);
	}

	.translation-selector__trigger:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 2px;
	}

	.translation-selector__icon {
		display: grid;
		place-items: center;
		transform: rotate(0deg);
		transform-origin: center;
		transition: transform 250ms ease-out;
	}

	.translation-selector__icon--expanded {
		transform: rotate(180deg);
	}

	.translation-selector__icon :global(svg) {
		width: var(--verski-icon-size-disclosure);
		height: var(--verski-icon-size-disclosure);
	}

	.translation-selector__choices {
		margin: 0.25rem 0 0;
		padding: 0;
		border-block: 1px solid var(--verski-border-subtle);
		list-style: none;
	}

	.translation-selector__choices li {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.translation-selector__choice {
		width: 100%;
		margin: 0;
		padding: 0.65rem 0.5rem;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		font-family: var(--verski-font-ui);
		font-weight: var(--verski-font-weight-regular);
		text-align: center;
	}

	.translation-selector__choice:hover,
	.translation-selector__choice:focus-visible {
		background: transparent;
		color: var(--verski-state-active-text);
	}

	.translation-selector__choice[aria-current='true'] {
		color: var(--verski-state-active-text);
		font-weight: var(--verski-font-weight-medium);
	}

	.translation-selector__status,
	.translation-selector__error {
		margin: 0.5rem 0 0;
		text-align: center;
	}

	.translation-selector__error {
		color: var(--pico-del-color);
	}

	@media (prefers-reduced-motion: reduce) {
		.translation-selector__icon {
			transition: none;
		}
	}
</style>
