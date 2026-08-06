<script lang="ts">
	type Theme = 'system' | 'light' | 'dark';

	let selectedTheme = $state<Theme>('system');

	function handleThemeChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		selectedTheme = select.value as Theme;

		if (selectedTheme === 'system') {
			delete document.documentElement.dataset.theme;
			return;
		}

		document.documentElement.dataset.theme = selectedTheme;
	}
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
