import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',

	use: {
		baseURL
	},

	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
		url: baseURL
	}
});
