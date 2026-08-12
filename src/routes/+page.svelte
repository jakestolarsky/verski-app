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

	let { data }: { data: PageData } = $props();

	const staticRepository = $derived(new StaticBibleRepository(data.translationPackage));
	let persistentRepository = $state<BibleRepository | null>(null);
	const repository = $derived(persistentRepository ?? staticRepository);

	let recentLookups = $state<RecentLookup[]>([]);
	let recentLookupStore = $state<RecentLookupStore | null>(null);
	let offlineStorageStatus = $state<'preparing' | 'ready' | 'unavailable'>('preparing');

	onMount(() => {
		let preparedStorage: PreparedBrowserStorage | null = null;
		let disposed = false;

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
				offlineStorageStatus = 'ready';
			})
			.catch(() => {
				if (!disposed) {
					persistentRepository = null;
					recentLookupStore = null;
					offlineStorageStatus = 'unavailable';
				}
			});

		return () => {
			disposed = true;
			preparedStorage?.close();
		};
	});
</script>

<svelte:head>
	<title>Verski - Bible lookup done right</title>
	<meta name="description" content="Fast, offline-first Bible passage lookup." />
</svelte:head>

<main class="container">
	<header>
		<p>Verski</p>
		<h1>Bible lookup done right</h1>
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
		bind:recentLookups
		bind:recentLookupStore
	/>
</main>
