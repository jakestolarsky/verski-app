<script lang="ts">
	import { onMount } from 'svelte';

	import BibleLookupWorkspace from '$lib/components/BibleLookupWorkspace.svelte';
	import type { RecentLookup } from '$lib/domain/recent-lookup';
	import {
		prepareBrowserStorage,
		type PreparedBrowserStorage
	} from '$lib/platform/prepare-browser-storage';
	import type { BibleRepository } from '$lib/storage/bible-repository';
	import type { RecentLookupStore } from '$lib/storage/recent-lookup-store';
	import { StaticBibleRepository } from '$lib/storage/static-bible-repository';
	import type { PageData } from './$types';
	import { saveUserSettings } from '$lib/application/save-user-settings';
	import SettingsMenu from '$lib/components/SettingsMenu.svelte';
	import { defaultUserSettings, type UserSettings } from '$lib/domain/user-settings';
	import { applyThemePreference, readStoredThemePreference } from '$lib/platform/theme-preference';
	import type { UserSettingsStore } from '$lib/storage/user-settings-store';
	import { buildBibleNavigation } from '$lib/application/build-bible-navigation';
	import BibleNavigationMenu from '$lib/components/BibleNavigationMenu.svelte';
	import type { BibleReference } from '$lib/domain/bible-reference';
	import { clearRecentLookups } from '$lib/application/clear-recent-lookups';

	type BibleLookupWorkspaceHandle = {
		openChapter: (bookId: string, chapter: number) => Promise<boolean>;
	};

	let { data }: { data: PageData } = $props();

	const bibleNavigation = $derived(buildBibleNavigation(data.translationPackage));

	let bibleLookupWorkspace = $state<BibleLookupWorkspaceHandle>();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let persistentRepository = $state<BibleRepository | null>(null);
	const repository = $derived(persistentRepository ?? staticRepository);

	let recentLookups = $state<RecentLookup[]>([]);
	let recentLookupStore = $state<RecentLookupStore | null>(null);
	let activeReference = $state<BibleReference | null>(null);
	let offlineStorageStatus = $state<'preparing' | 'ready' | 'unavailable'>('preparing');

	let userSettings = $state<UserSettings>(structuredClone(defaultUserSettings));
	let userSettingsStore = $state<UserSettingsStore | null>(null);

	onMount(() => {
		let preparedStorage: PreparedBrowserStorage | null = null;
		let disposed = false;

		const legacyTheme = readStoredThemePreference();

		void prepareBrowserStorage(data.translationPackage, recentLookups)
			.then((storage) => {
				if (disposed) {
					storage.close();
					return;
				}

				preparedStorage = storage;
				persistentRepository = storage.bibleRepository;
				recentLookupStore = storage.recentLookupStore;
				recentLookups = storage.recentLookups;

				let preparedSettings = storage.userSettings;

				if (preparedSettings.theme === 'system' && legacyTheme !== null) {
					preparedSettings = {
						...preparedSettings,
						theme: legacyTheme
					};

					if (storage.userSettingsStore !== null) {
						void saveUserSettings(storage.userSettingsStore, preparedSettings);
					}
				}

				userSettings = preparedSettings;
				userSettingsStore = storage.userSettingsStore;
				applyThemePreference(preparedSettings.theme);

				offlineStorageStatus = 'ready';
			})
			.catch(() => {
				if (!disposed) {
					persistentRepository = null;
					recentLookupStore = null;
					userSettingsStore = null;
					offlineStorageStatus = 'unavailable';
				}
			});

		return () => {
			disposed = true;
			preparedStorage?.close();
		};
	});

	async function handleSettingsChange(nextSettings: UserSettings) {
		userSettings = nextSettings;

		const settingsStore = userSettingsStore;

		if (settingsStore === null) {
			return;
		}

		try {
			await saveUserSettings(settingsStore, nextSettings);
		} catch {
			userSettingsStore = null;
		}
	}

	async function handleClearRecentLookups() {
		recentLookups = [];

		const historyStore = recentLookupStore;

		if (historyStore === null) {
			return;
		}

		try {
			await clearRecentLookups(historyStore);
		} catch {
			recentLookupStore = null;
		}
	}

	async function handleChapterSelect(bookId: string, chapter: number): Promise<boolean> {
		const workspace = bibleLookupWorkspace;

		if (workspace === undefined) {
			return false;
		}

		return workspace.openChapter(bookId, chapter);
	}
</script>

<svelte:head>
	<title>Verski - Bible lookup done right</title>
	<meta name="description" content="Fast, offline-first Bible passage lookup." />
</svelte:head>

<main class="app-shell">
	<header class="page-header">
		<div class="page-header__navigation">
			<BibleNavigationMenu
				translationName={data.translationPackage.manifest.name}
				navigation={bibleNavigation}
				selectedBookId={activeReference?.bookId ?? null}
				selectedChapter={activeReference?.chapter ?? null}
				onChapterSelect={handleChapterSelect}
			/>
		</div>

		<div class="page-header__settings">
			<SettingsMenu
				settings={userSettings}
				disabled={offlineStorageStatus === 'preparing'}
				recentLookupCount={recentLookups.length}
				onChange={handleSettingsChange}
				onClearRecentLookups={handleClearRecentLookups}
			/>
		</div>
	</header>

	{#if offlineStorageStatus === 'unavailable'}
		<p class="offline-storage-message" role="status">
			Offline storage could not be restored. The bundled translation is still available, but recent
			lookups and settings may not be saved.
		</p>
	{/if}

	{#if activeReference === null}
		<section class="brand-hero" aria-labelledby="verski-brand-heading">
			<h1 id="verski-brand-heading" class="visually-hidden">Verski</h1>

			<img class="brand-hero__mark" src="/verski-icon.svg" width="180" height="180" alt="" />

			<p>Bible lookup done right</p>
		</section>
	{/if}

	{#if offlineStorageStatus === 'unavailable'}
		<p role="status">
			Offline storage is unavailable. This translation will remain available for the current
			session.
		</p>
	{/if}

	<BibleLookupWorkspace
		bind:this={bibleLookupWorkspace}
		bind:activeReference
		{repository}
		translationId={data.translationPackage.manifest.id}
		translationName={data.translationPackage.manifest.name}
		readingSettings={userSettings.reading}
		bind:recentLookups
		bind:recentLookupStore
	/>
</main>

<style>
	:global(html) {
		min-width: 20rem;
		min-height: 100%;
		background-color: var(--verski-background);
		overscroll-behavior-y: none;
	}

	:global(body) {
		position: relative;
		min-height: 100%;
		margin: 0;
		background: var(--verski-background);
		overscroll-behavior-y: none;
		isolation: isolate;
	}

	:global(body::before) {
		content: '';
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: var(--verski-app-background);
	}

	:global(body::after) {
		content: '';
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background-image: var(--verski-noise-texture);
		background-repeat: repeat;
		background-size: var(--verski-noise-size);
		opacity: var(--verski-noise-opacity);
		mix-blend-mode: var(--verski-noise-blend-mode);
	}

	.app-shell {
		position: relative;
		z-index: var(--verski-layer-content);
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--verski-shell-max-width);
		min-height: 100vh;
		min-height: 100svh;
		margin-inline: auto;
		padding-block-start: max(var(--verski-shell-padding-block), env(safe-area-inset-top, 0px));
		padding-inline-end: max(var(--verski-shell-padding-inline), env(safe-area-inset-right, 0px));
		padding-block-end: max(var(--verski-shell-padding-block), env(safe-area-inset-bottom, 0px));
		padding-inline-start: max(var(--verski-shell-padding-inline), env(safe-area-inset-left, 0px));
	}

	.page-header {
		position: sticky;
		top: max(0.5rem, env(safe-area-inset-top, 0px));
		z-index: var(--verski-layer-header);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--pico-spacing);
		width: 100%;
		overflow: visible;
		pointer-events: none;
	}

	.page-header__navigation,
	.page-header__settings {
		pointer-events: auto;
	}

	.offline-storage-message {
		max-width: 40rem;
		margin: var(--pico-spacing) auto 0;
		padding: 0.75rem 1rem;
		border: 1px solid var(--verski-border-subtle);
		border-radius: var(--pico-border-radius);
		background: color-mix(in srgb, var(--verski-surface) 40%, transparent);
		color: var(--verski-text);
		text-align: center;
	}

	@media (max-width: 36rem) {
		.page-header {
			gap: 0.75rem;
		}
	}

	.brand-hero {
		display: grid;
		min-height: clamp(14rem, 38svh, 24rem);
		padding-block: clamp(2rem, 8svh, 5rem);
		place-items: center;
		align-content: center;
		gap: 0.75rem;
		text-align: center;
	}

	.brand-hero__mark {
		width: clamp(7.5rem, 32vw, 11rem);
		height: auto;
	}

	.brand-hero p {
		margin: 0;
		color: var(--verski-primary);
		font-family: var(--verski-font-display);
		font-size: clamp(1.35rem, 5vw, 1.75rem);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
