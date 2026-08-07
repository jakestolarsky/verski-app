import { expect, test } from '@playwright/test';

test('starts offline and looks up a cached passage', async ({ context, page }) => {
	await page.goto('/');

	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});

	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	await page.close();
	await context.setOffline(true);

	const offlinePage = await context.newPage();

	await offlinePage.goto('/', {
		waitUntil: 'domcontentloaded'
	});

	const referenceInput = offlinePage.getByLabel('Bible reference');

	await referenceInput.fill('John 3:16');
	await referenceInput.press('Enter');

	await expect(offlinePage.getByText(/For God so loved the world/)).toBeVisible();
});
