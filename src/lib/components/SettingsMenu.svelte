<script lang="ts">
	import {
		isTheme,
		type ReadingFontSize,
		type ReadingLineHeight,
		type ReadingSettings,
		type Theme,
		type UserSettings
	} from '$lib/domain/user-settings';
	import { applyThemePreference } from '$lib/platform/theme-preference';
	import { appMetadata } from '$lib/platform/app-metadata';

	/* icons */
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import ALargeSmallIcon from '@lucide/svelte/icons/a-large-small';
	import ArrowDownWideNarrowIcon from '@lucide/svelte/icons/arrow-down-wide-narrow';
	import CircleMinusIcon from '@lucide/svelte/icons/circle-minus';
	import CirclePlusIcon from '@lucide/svelte/icons/circle-plus';
	import CircleIcon from '@lucide/svelte/icons/circle';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import TextInitialIcon from '@lucide/svelte/icons/text-initial';
	import LaptopMinimalIcon from '@lucide/svelte/icons/laptop-minimal';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import LinkIcon from '@lucide/svelte/icons/link';

	type Props = {
		settings: UserSettings;
		disabled?: boolean;
		recentLookupCount?: number;
		onChange: (settings: UserSettings) => void | Promise<void>;
		onClearRecentLookups?: () => void | Promise<void>;
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

	const themeOptions = ['light', 'dark', 'system'] as const satisfies readonly Theme[];

	const themeLabels = {
		system: 'System',
		light: 'Light',
		dark: 'Dark'
	} satisfies Record<Theme, string>;

	const fontSizes = ['small', 'default', 'large'] as const satisfies readonly ReadingFontSize[];
	const lineHeights = [
		'compact',
		'default',
		'relaxed'
	] as const satisfies readonly ReadingLineHeight[];

	const fontSizeLabels = {
		small: 'Small',
		default: 'Default',
		large: 'Large'
	} satisfies Record<ReadingFontSize, string>;

	const lineHeightLabels = {
		compact: 'Compact',
		default: 'Default',
		relaxed: 'Relaxed'
	} satisfies Record<ReadingLineHeight, string>;

	let {
		settings,
		disabled = false,
		recentLookupCount = 0,
		onChange,
		onClearRecentLookups = () => {}
	}: Props = $props();

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

	async function updateReadingSettings(reading: ReadingSettings) {
		await onChange({
			...settings,
			reading
		});
	}

	function getAdjacentValue<T>(values: readonly T[], currentValue: T, direction: -1 | 1): T | null {
		const currentIndex = values.indexOf(currentValue);
		const nextValue = values[currentIndex + direction];

		return nextValue ?? null;
	}

	async function changeFontSize(direction: -1 | 1) {
		const fontSize = getAdjacentValue(fontSizes, settings.reading.fontSize, direction);

		if (fontSize === null) {
			return;
		}

		await updateReadingSettings({
			...settings.reading,
			fontSize
		});
	}

	async function changeLineHeight(direction: -1 | 1) {
		const lineHeight = getAdjacentValue(lineHeights, settings.reading.lineHeight, direction);

		if (lineHeight === null) {
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
		const input = event.currentTarget as HTMLInputElement;
		const theme = input.value;

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
				tabindex="-1"
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
					class="reading-preview"
					aria-label="Reading preview"
					data-font-size={settings.reading.fontSize}
					data-line-height={settings.reading.lineHeight}
				>
					<p>
						{#if settings.reading.showVerseNumbers}
							<sup>16</sup>
						{/if}

						For God so loved the world, that he gave his one and only Son, that whoever believes in
						him should not perish, but have eternal life.
					</p>
				</section>
				<div
					id="settings-panel-display"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-display"
				>
					<fieldset class="reading-controls">
						<legend class="visually-hidden">Reading</legend>

						<div class="setting-row">
							<div class="setting-row__label">
								<ALargeSmallIcon aria-hidden="true" />
								<span>Text size</span>
							</div>

							<div class="setting-stepper">
								<output class="visually-hidden" aria-live="polite">
									Text size: {fontSizeLabels[settings.reading.fontSize]}
								</output>

								<button
									type="button"
									aria-label="Decrease text size"
									disabled={settings.reading.fontSize === 'small'}
									onclick={() => changeFontSize(-1)}
								>
									<CircleMinusIcon aria-hidden="true" />
								</button>

								<button
									type="button"
									aria-label="Increase text size"
									disabled={settings.reading.fontSize === 'large'}
									onclick={() => changeFontSize(1)}
								>
									<CirclePlusIcon aria-hidden="true" />
								</button>
							</div>
						</div>

						<div class="setting-row">
							<div class="setting-row__label">
								<ArrowDownWideNarrowIcon aria-hidden="true" />
								<span>Line spacing</span>
							</div>

							<div class="setting-stepper">
								<output class="visually-hidden" aria-live="polite">
									Line spacing: {lineHeightLabels[settings.reading.lineHeight]}
								</output>

								<button
									type="button"
									aria-label="Decrease line spacing"
									disabled={settings.reading.lineHeight === 'compact'}
									onclick={() => changeLineHeight(-1)}
								>
									<CircleMinusIcon aria-hidden="true" />
								</button>

								<button
									type="button"
									aria-label="Increase line spacing"
									disabled={settings.reading.lineHeight === 'relaxed'}
									onclick={() => changeLineHeight(1)}
								>
									<CirclePlusIcon aria-hidden="true" />
								</button>
							</div>
						</div>

						<label class="setting-row setting-row--toggle" for="show-verse-numbers">
							<span class="setting-row__label">
								<TextInitialIcon aria-hidden="true" />
								<span>Show verse numbers</span>
							</span>

							<span class="setting-toggle">
								<input
									id="show-verse-numbers"
									class="setting-toggle__input"
									type="checkbox"
									checked={settings.reading.showVerseNumbers}
									onchange={handleVerseNumbersChange}
								/>

								<span class="setting-toggle__icon" aria-hidden="true">
									{#if settings.reading.showVerseNumbers}
										<CircleCheckIcon />
									{:else}
										<CircleIcon />
									{/if}
								</span>
							</span>
						</label>
					</fieldset>

					<fieldset class="theme-controls">
						<legend class="visually-hidden">Theme</legend>

						{#each themeOptions as theme}
							<label class="theme-option">
								<input
									type="radio"
									name="theme"
									value={theme}
									checked={settings.theme === theme}
									aria-label={`${themeLabels[theme]} theme`}
									onchange={handleThemeChange}
								/>

								<span class="theme-option__icon" aria-hidden="true">
									{#if theme === 'light'}
										<SunIcon />
									{:else if theme === 'dark'}
										<MoonIcon />
									{:else}
										<LaptopMinimalIcon />
									{/if}
								</span>
							</label>
						{/each}
					</fieldset>
				</div>
			{:else if activeSection === 'system'}
				<div
					id="settings-panel-system"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-system"
					tabindex="0"
				>
					<section class="system-setting" aria-labelledby="history-settings-heading">
						<h3 id="history-settings-heading">Recent lookups</h3>

						{#if recentLookupCount === 0}
							<p>There are no recent lookups to remove.</p>
						{:else}
							<p>
								Remove all {recentLookupCount}
								{recentLookupCount === 1 ? 'recent lookup' : 'recent lookups'}.
							</p>
						{/if}

						<button
							class="clear-history secondary outline"
							type="button"
							disabled={recentLookupCount === 0}
							onclick={onClearRecentLookups}
						>
							<TrashIcon aria-hidden="true" />
							<span>Clear history</span>
						</button>
					</section>
				</div>
			{:else}
				<div
					id="settings-panel-about"
					class="settings-panel"
					role="tabpanel"
					aria-labelledby="settings-tab-about"
					tabindex="0"
				>
					<section class="about-section" aria-labelledby="about-heading">
						<dl class="about-metadata">
							<div>
								<dt>Version</dt>
								<dd>{appMetadata.version}</dd>
							</div>

							<div>
								<dt>Build</dt>
								<dd><code>{appMetadata.commit}</code></dd>
							</div>

							<div>
								<dt>Author</dt>
								<dd>{appMetadata.author}</dd>
							</div>
						</dl>

						<a
							class="repository-link"
							href={appMetadata.repositoryUrl}
							target="_blank"
							rel="noreferrer"
						>
							<LinkIcon aria-hidden="true" />
							<span>GitHub repository</span>
						</a>
					</section>
				</div>
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

	.settings-tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin-block-end: var(--pico-spacing);
		border-block-end: 1px solid var(--verski-border-subtle);
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

	.reading-preview {
		margin-block-end: var(--pico-spacing);
		padding: 1rem;
		border: 1px solid var(--verski-border-subtle);
		border-radius: 0.5rem;
	}

	.reading-preview p {
		margin: 0;
		font-family: var(--verski-font-reading);
		font-size: var(--verski-reading-size-default);
		font-weight: var(--verski-font-weight-regular);
		line-height: var(--verski-reading-line-height-default);
	}

	.reading-preview[data-font-size='small'] p {
		font-size: var(--verski-reading-size-small);
	}

	.reading-preview[data-font-size='large'] p {
		font-size: var(--verski-reading-size-large);
	}

	.reading-preview[data-line-height='compact'] p {
		line-height: var(--verski-reading-line-height-compact);
	}

	.reading-preview[data-line-height='relaxed'] p {
		line-height: var(--verski-reading-line-height-relaxed);
	}

	.reading-preview sup {
		margin-inline-end: 0.25em;
	}

	.reading-controls {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.setting-row {
		display: flex;
		min-height: 2.75rem;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.setting-row__label {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.75rem;
		font-weight: var(--verski-font-weight-medium);
	}

	.setting-row__label :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
		flex: 0 0 auto;
	}

	.setting-stepper {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.25rem;
	}

	.setting-stepper button {
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
	}

	.setting-stepper button:disabled {
		opacity: 0.4;
	}

	.setting-stepper button :global(svg) {
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

	.setting-row--toggle {
		cursor: pointer;
	}

	.setting-toggle {
		position: relative;
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		place-items: center;
	}

	.setting-toggle__icon {
		display: grid;
		place-items: center;
		color: var(--verski-text);
		pointer-events: none;
	}

	.setting-toggle__icon :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.setting-toggle__input:focus-visible + .setting-toggle__icon {
		border-radius: 50%;
		outline: 2px solid var(--verski-focus);
		outline-offset: 0.25rem;
	}

	.setting-row--toggle:hover .setting-toggle__icon {
		color: var(--verski-state-active-text);
	}

	.setting-toggle__input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.theme-controls {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-block-start: 2rem;
		margin-block-end: 0;
		padding: 0;
		border: 0;
	}

	.theme-option {
		position: relative;
		display: grid;
		width: 2.75rem;
		min-width: 2.75rem;
		height: 2.75rem;
		margin: 0;
		place-items: center;
		cursor: pointer;
	}

	.theme-option input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.theme-option__icon {
		display: grid;
		place-items: center;
		border-radius: 50%;
		color: var(--verski-text);
		pointer-events: none;
	}

	.theme-option__icon :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.theme-option input:checked + .theme-option__icon {
		width: 2.25rem;
		height: 2.25rem;
		background: var(--verski-text);
		color: var(--verski-background);
	}

	.theme-option input:focus-visible + .theme-option__icon {
		outline: 2px solid var(--verski-focus);
		outline-offset: 0.25rem;
	}

	.theme-option:hover .theme-option__icon {
		color: var(--verski-state-active-text);
	}

	.theme-option:hover input:checked + .theme-option__icon {
		color: var(--verski-background);
	}

	.system-setting h3 {
		margin-block-end: 0.5rem;
		font-family: var(--verski-font-ui);
		font-size: 1rem;
		font-weight: var(--verski-font-weight-medium);
	}

	.system-setting p {
		color: var(--verski-border-subtle);
	}

	button.clear-history {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0;
	}

	button.clear-history :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}

	.about-metadata {
		display: grid;
		gap: 0.75rem;
		margin-block-end: 1.5rem;
	}

	.about-metadata div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.about-metadata dt {
		font-weight: var(--verski-font-weight-medium);
	}

	.about-metadata dd {
		margin: 0;
		text-align: end;
	}

	.repository-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.repository-link :global(svg) {
		width: var(--verski-icon-size-action);
		height: var(--verski-icon-size-action);
	}
</style>
