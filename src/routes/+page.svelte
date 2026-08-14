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

		<div class="page-header__brand">
			<p>Verski</p>
			<h1>Bible lookup done right</h1>
		</div>

		<div class="page-header__settings">
			<SettingsMenu
				settings={userSettings}
				disabled={offlineStorageStatus === 'preparing'}
				onChange={handleSettingsChange}
			/>
		</div>
	</header>

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
	}

	:global(body) {
		min-height: 100%;
		margin: 0;
		background: var(--verski-app-background);
	}

	:global(body::before) {
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
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: var(--pico-spacing);
		align-items: start;
		position: sticky;
		top: 0;
		overflow: hidden;
		z-index: var(--verski-layer-header);
	}

	.page-header__navigation {
		justify-self: start;
	}

	.page-header__brand {
		text-align: center;
	}

	.page-header__brand p,
	.page-header__brand h1 {
		margin-inline: 0;
	}

	.page-header__brand h1 {
		margin-bottom: var(--pico-spacing);
	}

	.page-header__settings {
		justify-self: end;
	}

	@media (max-width: 36rem) {
		.page-header {
			grid-template-columns: auto 1fr auto;
			gap: 0.75rem;
		}

		.page-header__brand h1 {
			font-size: 1.35rem;
		}
	}
</style>
