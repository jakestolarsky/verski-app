<script lang="ts">
	import {
		availableThemes,
		isTheme,
		type ReadingFontSize,
		type ReadingLineHeight,
		type ReadingSettings,
		type Theme,
		type UserSettings
	} from '$lib/domain/user-settings';
	import { applyThemePreference } from '$lib/platform/theme-preference';

	/* icons */
	import SettingsIcon from '@lucide/svelte/icons/settings';

	type Props = {
		settings: UserSettings;
		disabled?: boolean;
		onChange: (settings: UserSettings) => void | Promise<void>;
	};

	type SettingsSection = 'display' | 'system' | 'about';

	const settingsSections = [
		{ id: 'display', label: 'Display' },
		{ id: 'system', label: 'System' },
		{ id: 'about', label: 'About' }
	] as const satisfies ReadonlyArray<{
		id: SettingsSection;
		label: string;
	}>;

	let activeSection = $state<SettingsSection>('display');

	const themeLabels = {
		system: 'System',
		light: 'Light',
		dark: 'Dark'
	} satisfies Record<Theme, string>;

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

	function selectSection(section: SettingsSection) {
		activeSection = section;
	}

	function handleTablistKeydown(event: KeyboardEvent) {
		if (
			event.key !== 'ArrowLeft' &&
			event.key !== 'ArrowRight' &&
			event.key !== 'Home' &&
			event.key !== 'End'
		) {
			return;
		}

		const tablist = event.currentTarget as HTMLElement;
		const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
		const currentIndex = tabs.indexOf(event.target as HTMLButtonElement);

		if (currentIndex === -1) {
			return;
		}

		let nextIndex = currentIndex;

		if (event.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % tabs.length;
		} else if (event.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = tabs.length - 1;
		}

		const nextTab = tabs[nextIndex];
		const nextSection = settingsSections[nextIndex];

		if (!nextTab || !nextSection) {
			return;
		}

		event.preventDefault();
		activeSection = nextSection.id;
		nextTab.focus();
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
		class="settings-trigger secondary outline"
		type="button"
		aria-label="Settings"
		aria-haspopup="dialog"
		{disabled}
		onclick={openMenu}
	>
		<SettingsIcon />
	</button>

	<dialog bind:this={dialogElement} aria-labelledby="settings-heading" onclose={handleDialogClose}>
		<article>
			<header>
				<h2 id="settings-heading">Settings</h2>

				<button
					class="settings-close secondary outline"
					type="button"
					aria-label="Close settings"
					onclick={closeMenu}
				>
					<SettingsIcon />
				</button>
			</header>

			<div
				class="settings-tabs"
				role="tablist"
				aria-label="Settings sections"
				onkeydown={handleTablistKeydown}
			>
				{#each settingsSections as section}
					<button
						id={`settings-tab-${section.id}`}
						class="settings-tab"
						type="button"
						role="tab"
						aria-selected={activeSection === section.id}
						aria-controls={`settings-panel-${section.id}`}
						tabindex={activeSection === section.id ? 0 : -1}
						onclick={() => selectSection(section.id)}
					>
						{section.label}
					</button>
				{/each}
			</div>

			{#if activeSection === 'display'}
				<section
					id="settings-panel-display"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-display"
				>
					<label for="theme-select">
						Theme

						<select id="theme-select" value={settings.theme} onchange={handleThemeChange}>
							{#each availableThemes as theme}
								<option value={theme}>{themeLabels[theme]}</option>
							{/each}
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
				</section>
			{:else if activeSection === 'system'}
				<section
					id="settings-panel-system"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-system"
					tabindex="0"
				>
					<p>System settings will appear here.</p>
				</section>
			{:else}
				<section
					id="settings-panel-about"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-about"
					tabindex="0"
				>
					<p>Application information will appear here.</p>
				</section>
			{/if}
		</article>
	</dialog>
</div>

<style>
	.settings-trigger,
	.settings-close {
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border-radius: 50%;
	}

	.settings-trigger :global(svg),
	.settings-close :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	dialog header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--pico-spacing);
	}

	dialog header h2 {
		margin-bottom: 0;
	}

	dialog article {
		min-width: min(28rem, calc(100vw - 2rem));
	}

	select {
		margin-bottom: 0;
	}

	.settings-tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin-block-end: var(--pico-spacing);
		border-block-end: 1px solid var(--verski-border);
	}

	.settings-tab {
		margin: 0;
		padding: 0.5rem;
		border: 0;
		border-block-end: 2px solid transparent;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		font-family: var(--verski-font-display);
		font-weight: 400;
	}

	.settings-tab[aria-selected='true'] {
		border-block-end-color: var(--verski-border-active);
		color: var(--verski-state-active-text);
	}

	.settings-panel {
		min-inline-size: 0;
	}
</style>
