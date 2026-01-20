import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-006: 기록 검색/필터', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('감정 필터 적용', async ({ page }) => {
    await page.goto('/journal');
    
    // 필터 버튼 클릭
    await page.locator('button:has-text("필터")').click();
    
    // 감정 필터 모달 표시 확인
    await expect(page.locator('[data-testid="filter-modal"]')).toBeVisible();
    
    // "불안" 감정 선택
    await page.locator('[data-testid="filter-emotion-anxiety"]').click();
    
    // 적용 버튼 클릭
    await page.locator('button:has-text("적용")').click();
    
    // 필터링된 결과 확인
    const entries = page.locator('[data-testid="timeline-entry"]');
    await expect(entries.first()).toBeVisible();
    
    // 필터 배지 표시 확인
    await expect(page.locator('[data-testid="active-filter-badge"]')).toContainText('불안');
  });

  test('키워드 검색', async ({ page }) => {
    await page.goto('/journal/search');
    
    // 검색어 입력
    await page.locator('[data-testid="search-input"]').fill('회사');
    await page.locator('[data-testid="search-button"]').click();
    
    // 검색 결과 표시 확인
    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible();
    
    // 검색어가 하이라이트되는지 확인
    await expect(page.locator('mark:has-text("회사")')).toBeVisible();
  });
});
