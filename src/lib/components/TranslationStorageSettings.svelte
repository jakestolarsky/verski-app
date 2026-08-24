<script lang="ts">
	import type { TranslationCatalogEntry } from '$lib/domain/translation-catalog';

	type Props = {
		translations: readonly TranslationCatalogEntry[];
		installedTranslationIds: readonly string[];
		activeTranslationId: string;
		defaultTranslationId: string;
		disabled?: boolean;
		onInstall: (translationId: string) => boolean | Promise<boolean>;
		onRemove: (translationId: string) => boolean | Promise<boolean>;
	};

	let {
		translations,
		installedTranslationIds,
		activeTranslationId,
		defaultTranslationId,
		disabled = false,
		onInstall,
		onRemove
	}: Props = $props();

	let pendingTranslationId = $state<string | null>(null);
	let operation = $state<'install' | 'remove' | null>(null);
	let failedTranslationId = $state<string | null>(null);

	function isInstalled(translationId: string): boolean {
		return installedTranslationIds.includes(translationId);
	}

	async function runOperation(translationId: string, nextOperation: 'install' | 'remove') {
		pendingTranslationId = translationId;
		operation = nextOperation;
		failedTranslationId = null;

		try {
			const succeeded =
				nextOperation === 'install'
					? await onInstall(translationId)
					: await onRemove(translationId);

			if (!succeeded) {
				failedTranslationId = translationId;
			}
		} catch {
			failedTranslationId = translationId;
		} finally {
			pendingTranslationId = null;
			operation = null;
		}
	}
</script>

<section class="translation-storage" aria-labelledby="translation-storage-heading">
	<h3 id="translation-storage-heading">Offline translations</h3>

	<ul>
		{#each translations as translation (translation.manifest.id)}
			{@const translationId = translation.manifest.id}
			{@const installed = isInstalled(translationId)}
			{@const isDefault = translationId === defaultTranslationId}
			{@const isActive = translationId === activeTranslationId}
			{@const isPending = pendingTranslationId === translationId}

			<li>
				<div class="translation-storage__description">
					<strong>{translation.manifest.name}</strong>

					<span>
						{#if isDefault}
							Bundled with Verski
						{:else if installed}
							Installed offline
						{:else}
							Available to install
						{/if}
					</span>

					{#if isActive && !isDefault}
						<small>Select another translation before removing it.</small>
					{/if}
				</div>

				{#if !isDefault}
					{#if installed}
						<button
							class="secondary outline"
							type="button"
							aria-label={`Remove ${translation.manifest.name}`}
							disabled={disabled || pendingTranslationId !== null || isActive}
							onclick={() => runOperation(translationId, 'remove')}
						>
							{isPending && operation === 'remove' ? 'Removing…' : 'Remove'}
						</button>
					{:else}
						<button
							class="secondary outline"
							type="button"
							aria-label={`Install ${translation.manifest.name}`}
							disabled={disabled || pendingTranslationId !== null}
							onclick={() => runOperation(translationId, 'install')}
						>
							{isPending && operation === 'install' ? 'Installing…' : 'Install'}
						</button>
					{/if}
				{/if}

				{#if failedTranslationId === translationId}
					<p class="translation-storage__error" role="alert">Could not update this translation.</p>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.translation-storage {
		margin-block-start: 2rem;
	}

	.translation-storage h3 {
		margin-block-end: 0.75rem;
		font-family: var(--verski-font-ui);
		font-size: 1rem;
		font-weight: var(--verski-font-weight-medium);
	}

	.translation-storage ul {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.translation-storage li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		padding-block: 1rem;
		border-block-end: 1px solid var(--verski-border-subtle);
	}

	.translation-storage__description {
		display: grid;
		min-width: 0;
		gap: 0.25rem;
	}

	.translation-storage__description strong {
		overflow-wrap: anywhere;
	}

	.translation-storage__description span,
	.translation-storage__description small {
		color: var(--verski-border-subtle);
	}

	.translation-storage button {
		width: auto;
		margin: 0;
	}

	.translation-storage__error {
		grid-column: 1 / -1;
		margin: 0;
		color: var(--verski-error);
	}
</style>
