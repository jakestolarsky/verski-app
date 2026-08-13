<script lang="ts">
	import type {
		ReadingFontSize,
		ReadingLineHeight,
		ReadingSettings,
		Theme,
		UserSettings
	} from '$lib/domain/user-settings';
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

	function isReadingFontSize(value: string): value is ReadingFontSize {
		return value === 'small' || value === 'default' || value === 'large';
	}

	function isReadingLineHeight(value: string): value is ReadingLineHeight {
		return value === 'compact' || value === 'default' || value === 'relaxed';
	}

	async function updateReadingSettings(reading: ReadingSettings) {
		await onChange({
			...settings,
			reading
		});
	}

	async function handleFontSizeChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const fontSize = select.value;

		if (!isReadingFontSize(fontSize)) {
			return;
		}

		await updateReadingSettings({
			...settings.reading,
			fontSize
		});
	}

	async function handleLineHeightChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const lineHeight = select.value;

		if (!isReadingLineHeight(lineHeight)) {
			return;
		}

		await updateReadingSettings({
			...settings.reading,
			lineHeight
		});
	}

	async function handleVerseNumbersChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		await updateReadingSettings({
			...settings.reading,
			showVerseNumbers: input.checked
		});
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

			<fieldset>
				<legend>Reading</legend>

				<label for="reading-font-size">
					Text size

					<select
						id="reading-font-size"
						value={settings.reading.fontSize}
						onchange={handleFontSizeChange}
					>
						<option value="small">Small</option>
						<option value="default">Default</option>
						<option value="large">Large</option>
					</select>
				</label>

				<label for="reading-line-height">
					Line spacing

					<select
						id="reading-line-height"
						value={settings.reading.lineHeight}
						onchange={handleLineHeightChange}
					>
						<option value="compact">Compact</option>
						<option value="default">Default</option>
						<option value="relaxed">Relaxed</option>
					</select>
				</label>

				<label for="show-verse-numbers">
					<input
						id="show-verse-numbers"
						type="checkbox"
						checked={settings.reading.showVerseNumbers}
						onchange={handleVerseNumbersChange}
					/>

					Show verse numbers
				</label>
			</fieldset>
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
