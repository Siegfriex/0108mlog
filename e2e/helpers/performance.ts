import { Page } from '@playwright/test';

export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const start = Date.now();
  await action();
  const end = Date.now();
  return end - start;
}

export async function waitForSave(page: Page, maxWait: number = 800) {
  const start = Date.now();
  await page.waitForSelector('[data-testid="save-success"]', { timeout: maxWait });
  const elapsed = Date.now() - start;
  return elapsed;
}
