<script lang="ts">
	import type { AppLocale } from '$lib/domain/user-settings';
	import * as m from '$lib/paraglide/messages.js';
	import XIcon from '@lucide/svelte/icons/x';

	type Props = {
		locale: AppLocale;
		onDismiss: () => void;
	};

	let { locale, onDismiss }: Props = $props();
</script>

<aside class="app-update-notice" role="status">
	<p>{m.app_update_available({}, { locale })}</p>

	<button type="button" aria-label={m.app_update_dismiss_label({}, { locale })} onclick={onDismiss}>
		<XIcon aria-hidden="true" />
	</button>
</aside>

<style>
	.app-update-notice {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		width: min(100%, 40rem);
		margin: var(--pico-spacing) auto 0;
		padding: 0.75rem 0.75rem 0.75rem 1rem;
		border: 1px solid var(--verski-border-active);
		border-radius: var(--verski-input-radius);
		background: var(--verski-surface);
		color: var(--verski-text);
	}

	.app-update-notice p {
		margin: 0;
	}

	.app-update-notice button {
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

	.app-update-notice button:hover {
		background: var(--verski-state-hover-background);
		color: var(--verski-primary);
	}

	.app-update-notice button :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}
</style>
