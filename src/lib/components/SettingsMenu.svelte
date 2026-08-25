<script lang="ts">
	import {
		availableLocales,
		isAppLocale,
		isTheme,
		type AppLocale,
		type ReadingFontSize,
		type ReadingLineHeight,
		type ReadingSettings,
		type Theme,
		type UserSettings
	} from '$lib/domain/user-settings';
	import { applyThemePreference } from '$lib/platform/theme-preference';
	import { appMetadata } from '$lib/platform/app-metadata';
	import type { TranslationManifest } from '$lib/domain/translation-package';
	import TranslationInfo from './TranslationInfo.svelte';
	import type { TranslationCatalogEntry } from '$lib/domain/translation-catalog';
	import TranslationStorageSettings from './TranslationStorageSettings.svelte';
	import * as m from '$lib/paraglide/messages.js';

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
		translationManifest: TranslationManifest;
		onChange: (settings: UserSettings) => void | Promise<void>;
		onClearRecentLookups?: () => void | Promise<void>;
		translations?: readonly TranslationCatalogEntry[];
		installedTranslationIds?: readonly string[];
		activeTranslationId?: string;
		defaultTranslationId?: string;
		translationStorageDisabled?: boolean;
		onInstallTranslation?: (translationId: string) => boolean | Promise<boolean>;
		onRemoveTranslation?: (translationId: string) => boolean | Promise<boolean>;
	};

	type SettingsSection = 'display' | 'system' | 'about';

	const settingsSections = [
		{ id: 'display', label: m.settings_tab_display },
		{ id: 'system', label: m.settings_tab_system },
		{ id: 'about', label: m.settings_tab_about }
	] as const satisfies ReadonlyArray<{
		id: SettingsSection;
		label: () => string;
	}>;

	let activeSection = $state<SettingsSection>('display');

	const themeOptions = ['light', 'dark', 'system'] as const satisfies readonly Theme[];

	const themeLabels = {
		system: m.settings_theme_system_label,
		light: m.settings_theme_light_label,
		dark: m.settings_theme_dark_label
	} satisfies Record<Theme, () => string>;

	const fontSizes = ['small', 'default', 'large'] as const satisfies readonly ReadingFontSize[];
	const lineHeights = [
		'compact',
		'default',
		'relaxed'
	] as const satisfies readonly ReadingLineHeight[];

	const fontSizeLabels = {
		small: m.settings_font_size_small,
		default: m.settings_font_size_default,
		large: m.settings_font_size_large
	} satisfies Record<ReadingFontSize, () => string>;

	const lineHeightLabels = {
		compact: m.settings_line_height_compact,
		default: m.settings_line_height_default,
		relaxed: m.settings_line_height_relaxed
	} satisfies Record<ReadingLineHeight, () => string>;

	const localeLabels = {
		en: m.language_english,
		pl: m.language_polish
	} satisfies Record<AppLocale, () => string>;

	let {
		settings,
		translationManifest,
		disabled = false,
		recentLookupCount = 0,
		onChange,
		onClearRecentLookups = () => {},
		translations = [],
		installedTranslationIds = [],
		activeTranslationId = translationManifest.id,
		defaultTranslationId = translationManifest.id,
		translationStorageDisabled = false,
		onInstallTranslation = () => false,
		onRemoveTranslation = () => false
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

	async function handleLocaleChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const locale = select.value;

		if (!isAppLocale(locale)) {
			return;
		}

		await onChange({
			...settings,
			locale
		});
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
		class="settings-trigger verski-round-action verski-round-action--secondary"
		type="button"
		aria-label={m.settings_trigger_label()}
		aria-haspopup="dialog"
		{disabled}
		onclick={openMenu}
	>
		<SettingsIcon aria-hidden="true" />
	</button>

	<dialog
		bind:this={dialogElement}
		class="settings-dialog"
		aria-labelledby="settings-heading"
		onclose={handleDialogClose}
	>
		<article class="settings-dialog__content">
			<header>
				<h2 id="settings-heading">{m.settings_title()}</h2>

				<button
					class="settings-close verski-round-action verski-round-action--secondary"
					type="button"
					aria-label={m.settings_close_label()}
					onclick={closeMenu}
				>
					<SettingsIcon aria-hidden="true" />
				</button>
			</header>

			<div
				class="settings-tabs"
				role="tablist"
				aria-label={m.settings_sections_label()}
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
						{section.label()}
					</button>
				{/each}
			</div>

			{#if activeSection === 'display'}
				<div
					id="settings-panel-display"
					class="settings-panel settings-panel--display"
					role="tabpanel"
					aria-labelledby="settings-tab-display"
				>
					<section
						class="reading-preview"
						aria-label={m.settings_reading_preview_label()}
						data-font-size={settings.reading.fontSize}
						data-line-height={settings.reading.lineHeight}
					>
						<p>
							{#if settings.reading.showVerseNumbers}
								<sup>16</sup>
							{/if}

							For God so loved the world, that he gave his one and only Son, that whoever believes
							in him should not perish, but have eternal life.
						</p>
					</section>
					<fieldset class="reading-controls">
						<legend class="visually-hidden">{m.settings_reading_legend()}</legend>

						<div class="setting-row">
							<div class="setting-row__label">
								<ALargeSmallIcon aria-hidden="true" />
								<span>{m.settings_text_size()}</span>
							</div>

							<div class="setting-stepper">
								<output class="visually-hidden" aria-live="polite">
									{m.settings_text_size_status({
										value: fontSizeLabels[settings.reading.fontSize]()
									})}
								</output>

								<button
									type="button"
									aria-label={m.settings_decrease_text_size()}
									disabled={settings.reading.fontSize === 'small'}
									onclick={() => changeFontSize(-1)}
								>
									<CircleMinusIcon aria-hidden="true" />
								</button>

								<button
									type="button"
									aria-label={m.settings_increase_text_size()}
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
								<span>{m.settings_line_spacing()}</span>
							</div>

							<div class="setting-stepper">
								<output class="visually-hidden" aria-live="polite">
									{m.settings_line_spacing_status({
										value: lineHeightLabels[settings.reading.lineHeight]()
									})}
								</output>

								<button
									type="button"
									aria-label={m.settings_decrease_line_spacing()}
									disabled={settings.reading.lineHeight === 'compact'}
									onclick={() => changeLineHeight(-1)}
								>
									<CircleMinusIcon aria-hidden="true" />
								</button>

								<button
									type="button"
									aria-label={m.settings_increase_line_spacing()}
									disabled={settings.reading.lineHeight === 'relaxed'}
									onclick={() => changeLineHeight(1)}
								>
									<CirclePlusIcon aria-hidden="true" />
								</button>
							</div>
						</div>

						<div class="setting-row">
							<div class="setting-row__label">
								<TextInitialIcon aria-hidden="true" />
								<span id="show-verse-numbers-label">{m.settings_show_verse_numbers()}</span>
							</div>

							<span class="setting-control-slot">
								<span class="setting-toggle">
									<input
										id="show-verse-numbers"
										class="setting-toggle__input"
										type="checkbox"
										checked={settings.reading.showVerseNumbers}
										aria-labelledby="show-verse-numbers-label"
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
							</span>
						</div>
					</fieldset>
					<fieldset class="theme-controls">
						<legend class="visually-hidden">{m.settings_theme_legend()}</legend>

						{#each themeOptions as theme}
							<label class="theme-option">
								<input
									type="radio"
									name="theme"
									value={theme}
									checked={settings.theme === theme}
									aria-label={themeLabels[theme]()}
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
					<section
						class="system-setting language-setting"
						aria-labelledby="language-settings-heading"
					>
						<h3 id="language-settings-heading">{m.settings_language_label()}</h3>

						<label class="visually-hidden" for="language-select">
							{m.settings_language_label()}
						</label>

						<select id="language-select" value={settings.locale} onchange={handleLocaleChange}>
							{#each availableLocales as locale}
								<option value={locale}>{localeLabels[locale]()}</option>
							{/each}
						</select>
					</section>

					<section class="system-setting" aria-labelledby="history-settings-heading">
						<h3 id="history-settings-heading">{m.settings_recent_heading()}</h3>

						{#if recentLookupCount === 0}
							<p>{m.settings_recent_empty()}</p>
						{:else if recentLookupCount === 1}
							<p>{m.settings_recent_remove_one()}</p>
						{:else}
							<p>{m.settings_recent_remove_many({ count: recentLookupCount })}</p>
						{/if}

						<button
							class="clear-history secondary outline"
							type="button"
							disabled={recentLookupCount === 0}
							onclick={onClearRecentLookups}
						>
							<TrashIcon aria-hidden="true" />
							<span>{m.settings_clear_history()}</span>
						</button>

						<TranslationStorageSettings
							{translations}
							{installedTranslationIds}
							{activeTranslationId}
							{defaultTranslationId}
							disabled={translationStorageDisabled}
							onInstall={onInstallTranslation}
							onRemove={onRemoveTranslation}
						/>
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
						<h3 id="about-heading">{m.settings_application_heading()}</h3>
						<dl class="about-metadata">
							<div>
								<dt>{m.settings_metadata_version()}</dt>
								<dd>{appMetadata.version}</dd>
							</div>

							<div>
								<dt>{m.settings_metadata_build()}</dt>
								<dd><code>{appMetadata.commit}</code></dd>
							</div>

							<div>
								<dt>{m.settings_metadata_author()}</dt>
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
							<span>{m.settings_github_repository()}</span>
						</a>
					</section>

					<TranslationInfo manifest={translationManifest} />
				</div>
			{/if}
		</article>
	</dialog>
</div>

<style>
	:global(html:has(dialog.settings-dialog[open])),
	:global(body:has(dialog.settings-dialog[open])) {
		overflow: hidden;
		overscroll-behavior: none;
	}

	dialog.settings-dialog {
		box-sizing: border-box;
		inset: 0;
		inline-size: 100%;
		max-inline-size: 100%;
		block-size: 100dvh;
		max-block-size: 100dvh;
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 0;
		border-radius: 0;
		background: var(--verski-background);
		color: var(--verski-text);
	}

	dialog.settings-dialog::backdrop {
		background: var(--verski-overlay-background);
	}

	.settings-dialog__content {
		display: flex;
		box-sizing: border-box;
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 100%;
		flex-direction: column;
		margin: 0;
		padding-block-start: max(var(--verski-shell-padding-block), env(safe-area-inset-top, 0px));
		padding-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		padding-block-end: max(var(--verski-shell-padding-block), env(safe-area-inset-bottom, 0px));
		padding-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
		overflow-y: auto;
		border: 0;
		border-radius: inherit;
		background: transparent;
		box-shadow: none;
	}

	.settings-dialog__content > header {
		display: grid;
		grid-template-columns:
			var(--verski-round-action-size)
			minmax(0, 1fr)
			var(--verski-round-action-size);
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 1rem;
		padding: 0;
		border: 0;
		background: transparent;
	}

	.settings-dialog__content > header h2 {
		grid-column: 2;
		margin: 0;
		font-family: var(--verski-font-display);
		font-size: clamp(1.75rem, 6vw, 2.25rem);
		font-style: italic;
		font-weight: var(--verski-font-weight-regular);
		line-height: 1;
		text-align: center;
	}

	.settings-close {
		grid-column: 3;
		justify-self: end;
	}

	.settings-tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		flex: 0 0 auto;
		margin-block-end: 1.25rem;
		border: 0;
	}

	.settings-tab {
		margin: 0;
		padding: 0.5rem 0.25rem;
		border: 0;
		border-block-end: 2px solid transparent;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		font-family: var(--verski-font-display);
		font-size: 1.125rem;
		font-weight: var(--verski-font-weight-regular);
	}

	.settings-tab:hover {
		background: transparent;
		color: var(--verski-state-active-text);
	}

	.settings-tab:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 0.125rem;
	}

	.settings-tab[aria-selected='true'] {
		border-block-end-color: var(--verski-border-active);
		color: var(--verski-state-active-text);
	}

	.settings-panel {
		min-inline-size: 0;
		flex: 1;
	}

	.settings-panel--display {
		display: flex;
		flex-direction: column;
	}

	.reading-preview {
		box-sizing: border-box;
		width: 100%;
		block-size: 5.5rem;
		min-block-size: 5.25rem;
		max-block-size: 5.5rem;
		margin-block-end: 1.5rem;
		padding: 1rem;
		overflow: auto;
		overscroll-behavior: contain;
		border: 1px solid var(--verski-border-subtle);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--verski-surface) 25%, transparent);
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
		gap: 1rem;
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
		width: var(--settings-control-size);
		min-width: var(--settings-control-size);
		height: var(--settings-control-size);
		margin: 0;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		box-shadow: none;
		color: var(--verski-text);
		cursor: pointer;
		transition:
			background-color var(--pico-transition),
			color var(--pico-transition);
	}

	.setting-stepper button:hover:not(:disabled) {
		color: var(--verski-state-active-text);
	}

	.setting-stepper button:focus-visible {
		outline: 2px solid var(--verski-focus);
		outline-offset: 0.125rem;
	}

	.setting-stepper button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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

	.setting-toggle {
		position: relative;
		display: grid;
		width: var(--settings-control-size);
		min-width: var(--settings-control-size);
		height: var(--settings-control-size);
		place-items: center;
		border-radius: 50%;
	}

	.setting-toggle:hover .setting-toggle__icon {
		color: var(--verski-state-active-text);
	}

	.setting-toggle__input {
		cursor: pointer;
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

	.setting-toggle__input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.reading-controls {
		--settings-control-size: 2.75rem;
		--settings-control-gap: 0.25rem;
	}

	.setting-control-slot {
		display: flex;
		inline-size: calc(2 * var(--settings-control-size) + var(--settings-control-gap));
		flex: 0 0 auto;
		align-items: center;
		justify-content: flex-start;
	}

	.theme-controls {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		margin-block-start: auto;
		margin-block-end: 0;
		padding-block-start: 2rem;
		padding-inline: 0;
		padding-block-end: 0;
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

	.language-setting {
		margin-block-end: 1.5rem;
	}

	.language-setting select {
		margin: 0;
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

	.about-section h3 {
		margin-block-end: 1rem;
		font-family: var(--verski-font-ui);
		font-size: 1rem;
		font-weight: var(--verski-font-weight-medium);
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

	@media (min-width: 48rem) {
		dialog.settings-dialog {
			inline-size: min(26rem, calc(100vw - 2rem));
			max-inline-size: min(26rem, calc(100vw - 2rem));
			block-size: min(46rem, calc(100dvh - 2rem));
			max-block-size: min(46rem, calc(100dvh - 2rem));
			margin: auto;
			border: 0;
			border-radius: 1rem;
		}
	}
</style>
