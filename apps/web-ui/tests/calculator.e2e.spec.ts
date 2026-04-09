import { expect, test } from '@playwright/test';

test('performs calculation and reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '+' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '=' }).click();
  await expect(page.locator('.lcd')).toContainText('4');
  await page.getByRole('button', { name: 'AC' }).click();
  await expect(page.locator('.lcd')).toContainText('0');
});
