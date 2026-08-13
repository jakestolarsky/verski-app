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

	let { data }: { data: PageData } = $props();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let persistentRepository = $state<BibleRepository | null>(null);
	const repository = $derived(persistentRepository ?? staticRepository);

	let recentLookups = $state<RecentLookup[]>([]);
	let recentLookupStore = $state<RecentLookupStore | null>(null);
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
</script>

<svelte:head>
	<title>Verski - Bible lookup done right</title>
	<meta name="description" content="Fast, offline-first Bible passage lookup." />
</svelte:head>

<main class="container">
	<header class="page-header">
		<div>
			<p>Verski</p>
			<h1>Bible lookup done right</h1>
		</div>

		<SettingsMenu
			settings={userSettings}
			disabled={offlineStorageStatus === 'preparing'}
			onChange={handleSettingsChange}
		/>
	</header>

	{#if offlineStorageStatus === 'unavailable'}
		<p role="status">
			Offline storage is unavailable. This translation will remain available for the current
			session.
		</p>
	{/if}

	<BibleLookupWorkspace
		{repository}
		translationId={data.translationPackage.manifest.id}
		translationName={data.translationPackage.manifest.name}
		readingSettings={userSettings.reading}
		bind:recentLookups
		bind:recentLookupStore
	/>
</main>

<style>
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--pico-spacing);
	}

	.page-header h1 {
		margin-bottom: var(--pico-spacing);
	}
</style>
