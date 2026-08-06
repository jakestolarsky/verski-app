<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'system' | 'light' | 'dark';

	const THEME_STORAGE_KEY = 'verski-theme';

	let selectedTheme = $state<Theme>('system');

	function isTheme(value: string | null): value is Theme {
		return value === 'system' || value === 'light' || value === 'dark';
	}

	function applyTheme(theme: Theme) {
		selectedTheme = theme;

		if (theme === 'system') {
			delete document.documentElement.dataset.theme;
			return;
		}

		document.documentElement.dataset.theme = theme;
	}

	function handleThemeChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const theme = select.value;

		if (!isTheme(theme)) {
			return;
		}

		applyTheme(theme);

		if (theme === 'system') {
			localStorage.removeItem(THEME_STORAGE_KEY);
		} else {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		}
	}

	onMount(() => {
		const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

		if (isTheme(storedTheme)) {
			applyTheme(storedTheme);
		}
	});
</script>

<div class="container theme-toolbar">
	<label for="theme-select">
		Theme

		<select id="theme-select" value={selectedTheme} onchange={handleThemeChange}>
			<option value="system">System</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>
</div>

<style>
	.theme-toolbar {
		display: flex;
		justify-content: flex-end;
		padding-top: 1rem;
	}

	label {
		width: 10rem;
		margin-bottom: 0;
	}

	select {
		margin-bottom: 0;
	}
</style>
