import { expect, test } from '@playwright/test';

test('starts offline and looks up a cached passage', async ({ context, page }) => {
	await page.goto('/');

	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});

	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	const onlineReferenceInput = page.getByLabel('Bible reference');

	await onlineReferenceInput.fill('John 3:16');
	await onlineReferenceInput.press('Enter');

	const onlinePassage = page.getByRole('region', {
		name: 'John 3:16'
	});

	await expect(onlinePassage.getByText(/For God so loved the world/)).toBeVisible({
		timeout: 15_000
	});

	await page.close();
	await context.setOffline(true);

	const offlinePage = await context.newPage();

	await offlinePage.goto('/', {
		waitUntil: 'domcontentloaded'
	});

	const referenceInput = offlinePage.getByLabel('Bible reference');

	await referenceInput.fill('John 3:16');
	await referenceInput.press('Enter');

	const offlinePassage = offlinePage.getByRole('region', {
		name: 'John 3:16'
	});

	await expect(offlinePassage.getByText(/For God so loved the world/)).toBeVisible({
		timeout: 15_000
	});
});
