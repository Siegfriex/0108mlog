import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-010: 리마인드 설정', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('알림 설정 변경', async ({ page }) => {
    await page.goto('/profile/settings');
    
    // 설정 페이지 표시 확인
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
    
    // 알림 설정 섹션으로 이동
    await page.locator('[data-testid="notification-settings"]').scrollIntoViewIfNeeded();
    
    // 알림 시간 변경
    await page.locator('[data-testid="notification-time"]').fill('21:00');
    
    // 알림 빈도 변경
    await page.locator('[data-testid="notification-frequency"]').selectOption('하루 2회');
    
    // 저장 버튼 클릭
    await page.locator('button:has-text("저장")').click();
    
    // 저장 성공 확인
    await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible({ timeout: 2000 });
    
    // 페이지 새로고침 후 설정 유지 확인
    await page.reload();
    const savedTime = await page.locator('[data-testid="notification-time"]').inputValue();
    expect(savedTime).toBe('21:00');
  });

  test('알림 끄기', async ({ page }) => {
    await page.goto('/profile/settings');
    
    // 알림 토글 끄기
    await page.locator('[data-testid="notification-toggle"]').click();
    
    // 알림 비활성화 상태 확인
    const isChecked = await page.locator('[data-testid="notification-toggle"]').isChecked();
    expect(isChecked).toBe(false);
    
    // 저장
    await page.locator('button:has-text("저장")').click();
    await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible({ timeout: 2000 });
  });
});
