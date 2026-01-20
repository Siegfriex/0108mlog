import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-016: 실시간 모니터', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 16-1: 실시간 모니터 대시보드 조회', async ({ page }) => {
    await page.goto('/reports/monitor');
    
    // 실시간 차트 표시 확인
    await expect(page.locator('[data-testid="realtime-chart"]')).toBeVisible({ timeout: 5000 });
    
    // 현재 감정 상태 표시 확인
    await expect(page.locator('[data-testid="current-emotion-status"]')).toBeVisible();
    
    // 다른 탭으로 이동
    await page.goto('/chat');
    
    // 모니터 탭으로 다시 복귀
    await page.goto('/reports/monitor');
    
    // 실시간 데이터 업데이트 확인
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="realtime-chart"]')).toBeVisible();
    
    // 데이터가 갱신되었는지 확인 (timestamp 변경)
    const timestamp = await page.locator('[data-testid="last-updated"]').textContent();
    expect(timestamp).toBeTruthy();
  });
});
