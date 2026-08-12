<script lang="ts">
	type Props = {
		value: string;
		onSubmit: (value: string) => void | Promise<void>;
		onClear: () => void;
	};

	let { value = $bindable(), onSubmit, onClear }: Props = $props();

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

<form onsubmit={handleSubmit}>
	<label for="reference">Bible reference</label>

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
				<span aria-hidden="true">×</span>
			</button>
		{/if}
	</div>

	<button type="submit">Lookup</button>
</form>

<style>
	.reference-search {
		position: relative;
		margin-bottom: var(--pico-spacing);
	}

	.reference-search input {
		margin-bottom: 0;
		padding-inline-end: 3.25rem;
	}

	.reference-search input::-webkit-search-cancel-button {
		appearance: none;
	}

	button.reference-search__clear {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-end: 0.25rem;
		transform: translateY(-50%);
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--verski-input-text);
		font-size: 1.35rem;
		line-height: 1;
	}

	button.reference-search__clear:hover {
		background: var(--verski-surface);
	}

	button.reference-search__clear:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: -2px;
	}
</style>
