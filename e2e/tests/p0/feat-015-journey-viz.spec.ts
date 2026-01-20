import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-015: 감정 여정 시각화', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 15-1: Sankey Flow 조회', async ({ page }) => {
    await page.goto('/journal/journey');
    
    // Sankey Flow 차트 표시 확인
    await expect(page.locator('[data-testid="sankey-chart"]')).toBeVisible({ timeout: 5000 });
    
    // 감정 간 전환 흐름 시각화 확인
    await expect(page.locator('[data-testid="flow-link"]')).toHaveCount(greaterThan(0));
    
    // 특정 노드 클릭
    await page.locator('[data-testid="flow-node"]').first().click();
    
    // 상세 정보 표시 확인
    await expect(page.locator('[data-testid="node-detail"]')).toBeVisible();
  });

  test('시나리오 15-2: Year in Pixels 조회', async ({ page }) => {
    await page.goto('/journal/journey');
    
    // "Year in Pixels" 탭 선택
    await page.locator('[data-testid="tab-year-pixels"]').click();
    
    // 연도별 픽셀 그리드 표시 확인
    await expect(page.locator('[data-testid="year-pixels-grid"]')).toBeVisible();
    
    // 각 날짜의 감정이 색상으로 표시되는지 확인
    const pixels = page.locator('[data-testid="pixel-day"]');
    await expect(pixels.first()).toBeVisible();
    
    // 특정 날짜 클릭
    await pixels.first().click();
    
    // 해당 날짜의 상세 정보 표시 확인
    await expect(page.locator('[data-testid="day-detail"]')).toBeVisible();
  });
});

function greaterThan(value: number) {
  return { asymmetricMatch: (actual: number) => actual > value };
}
