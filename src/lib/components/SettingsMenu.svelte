<script lang="ts">
	import type { Theme, UserSettings } from '$lib/domain/user-settings';
	import { applyThemePreference } from '$lib/platform/theme-preference';

	type Props = {
		settings: UserSettings;
		disabled?: boolean;
		onChange: (settings: UserSettings) => void | Promise<void>;
	};

	let { settings, disabled = false, onChange }: Props = $props();

	let triggerElement = $state<HTMLButtonElement>();
	let dialogElement = $state<HTMLDialogElement>();

	function openMenu() {
		dialogElement?.showModal();
	}

	function closeMenu() {
		dialogElement?.close();
	}

	function handleDialogClose() {
		triggerElement?.focus();
	}

	function isTheme(value: string): value is Theme {
		return value === 'system' || value === 'light' || value === 'dark';
	}

	async function handleThemeChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const theme = select.value;

		if (!isTheme(theme)) {
			return;
		}

		const nextSettings: UserSettings = {
			...settings,
			theme
		};

		applyThemePreference(theme);

		await onChange(nextSettings);
	}
</script>

<div class="settings-menu">
	<button
		bind:this={triggerElement}
		class="secondary outline"
		type="button"
		aria-haspopup="dialog"
		{disabled}
		onclick={openMenu}
	>
		Settings
	</button>

	<dialog bind:this={dialogElement} aria-labelledby="settings-heading" onclose={handleDialogClose}>
		<article>
			<header>
				<button class="close" type="button" aria-label="Close settings" onclick={closeMenu}
				></button>

				<h2 id="settings-heading">Settings</h2>
			</header>

			<label for="theme-select">
				Theme

				<select id="theme-select" value={settings.theme} onchange={handleThemeChange}>
					<option value="system">System</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
			</label>
		</article>
	</dialog>
</div>

<style>
	.settings-menu > button {
		width: auto;
		margin: 0;
		white-space: nowrap;
	}

	dialog article {
		min-width: min(28rem, calc(100vw - 2rem));
	}

	dialog header h2 {
		margin-bottom: 0;
	}

	select {
		margin-bottom: 0;
	}
</style>
