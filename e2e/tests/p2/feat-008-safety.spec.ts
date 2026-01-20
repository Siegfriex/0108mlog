import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-008: 안전망 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('안전망 페이지 접근', async ({ page }) => {
    await page.goto('/safety');
    
    // 안전망 메인 화면 표시 확인
    await expect(page.locator('[data-testid="safety-main"]')).toBeVisible();
    
    // 위기 지원 정보 표시 확인
    await expect(page.locator('[data-testid="crisis-support-info"]')).toBeVisible();
    
    // 긴급 연락처 확인
    await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();
    
    // 대처 도구 목록 확인
    await expect(page.locator('[data-testid="coping-tools"]')).toBeVisible();
  });

  test('호흡 운동 도구', async ({ page }) => {
    await page.goto('/safety/tools');
    
    // 대처 도구 페이지 표시 확인
    await expect(page.locator('[data-testid="coping-tools-page"]')).toBeVisible();
    
    // 호흡 운동 선택
    await page.locator('[data-testid="breathing-exercise"]').click();
    
    // 호흡 운동 시작
    await page.locator('button:has-text("시작")').click();
    
    // 호흡 가이드 애니메이션 확인
    await expect(page.locator('[data-testid="breathing-animation"]')).toBeVisible();
    
    // 완료 후 피드백 확인
    await page.waitForTimeout(5000); // 운동 진행
    await expect(page.locator('[data-testid="exercise-complete"]')).toBeVisible({ timeout: 10000 });
  });
});
