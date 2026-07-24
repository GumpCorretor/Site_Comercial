import { expect, test } from '@playwright/test';

test('carrega o esqueleto da aplicação web', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Central Comercial' })).toBeVisible();
  await expect(page.getByText('Scaffold web React + Vite em funcionamento.')).toBeVisible();
  await expect(page.getByText('API configurada em: http://127.0.0.1:3001')).toBeVisible();
});
