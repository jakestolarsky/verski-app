<script lang="ts">
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

	export function focus() {
		inputElement?.focus();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		await onSubmit(value);
	}

	function handleClear() {
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
		class="reference-search-trigger"
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
				placeholder="John 3:16"
				autocomplete="off"
				bind:this={inputElement}
				bind:value
				onkeydown={handleKeydown}
			/>

			{#if value}
				<button
					class="reference-search__clear"
					type="button"
					aria-label="Clear"
					onclick={handleClear}
				>
					<XIcon aria-hidden="true" />
				</button>
			{/if}
		</div>

		<button class="reference-search__submit" type="submit" aria-label="Search Bible">
			<SearchIcon aria-hidden="true" />
		</button>
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
		margin-bottom: 0;
	}

	.reference-search input {
		appearance: none;
		margin-bottom: 0;
		padding-inline-end: 3.25rem;
		background-image: none;
		-webkit-appearance: none;
	}

	button.reference-search-trigger,
	button.reference-search__submit {
		display: grid;
		width: 3.25rem;
		min-width: 3.25rem;
		height: 3.25rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border-radius: 50%;
	}

	button.reference-search-trigger {
		margin-inline-start: auto;
	}

	button.reference-search-trigger :global(svg),
	button.reference-search__submit :global(svg),
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
	/**                */


	.reference-search input::-webkit-search-cancel-button {
		appearance: none;
	}

</style>
