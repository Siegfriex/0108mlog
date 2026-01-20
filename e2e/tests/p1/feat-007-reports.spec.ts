import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-007: 주간/월간 리포트 + 월간 회고록', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 7-1: 주간 리포트 조회', async ({ page }) => {
    await page.goto('/reports/weekly');
    
    // 주간 리포트 로딩 확인
    await expect(page.locator('[data-testid="weekly-report"]')).toBeVisible({ timeout: 5000 });
    
    // 감정 분포 차트 표시 확인
    await expect(page.locator('[data-testid="emotion-distribution-chart"]')).toBeVisible();
    
    // 감정 트렌드 차트 표시 확인
    await expect(page.locator('[data-testid="emotion-trend-chart"]')).toBeVisible();
    
    // 인사이트 텍스트 표시 확인
    await expect(page.locator('[data-testid="weekly-insights"]')).toBeVisible();
    
    // "다음 주 실험" 카드 확인
    await expect(page.locator('[data-testid="experiment-card"]')).toBeVisible();
  });

  test('시나리오 7-2: 월간 회고록 조회', async ({ page }) => {
    await page.goto('/reports/monthly-retrospective');
    
    // 월간 회고록 로딩 확인
    await expect(page.locator('[data-testid="monthly-retrospective"]')).toBeVisible({ timeout: 5000 });
    
    // "선공감 후분석" UX 확인 (먼저 따뜻한 서사)
    await expect(page.locator('[data-testid="empathy-narrative"]')).toBeVisible();
    
    // 감정 여정 서사 확인
    const narrative = await page.locator('[data-testid="emotion-journey-narrative"]').textContent();
    expect(narrative).toBeTruthy();
    
    // 스크롤하여 분석 섹션 확인
    await page.locator('[data-testid="analysis-section"]').scrollIntoViewIfNeeded();
    
    // 데이터 기반 분석 표시 확인
    await expect(page.locator('[data-testid="data-analysis"]')).toBeVisible();
  });
});
