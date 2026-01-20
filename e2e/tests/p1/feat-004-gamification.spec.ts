import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-004: 게이미피케이션', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('XP 획득 및 레벨업 확인', async ({ page }) => {
    await page.goto('/profile');
    
    // 현재 XP 및 레벨 확인
    const initialXP = await page.locator('[data-testid="current-xp"]').textContent();
    const initialLevel = await page.locator('[data-testid="current-level"]').textContent();
    
    // 감정 체크인 완료하여 XP 획득
    await page.goto('/chat');
    await page.locator('[data-testid="emotion-joy"]').click();
    await page.locator('[data-testid="intensity-slider"]').fill('7');
    await page.locator('button:has-text("대화 시작하기")').click();
    
    // 메시지 전송
    await page.locator('textarea[placeholder*="말씀해주세요"]').fill('테스트');
    await page.locator('[aria-label="전송"]').click();
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 8000 });
    
    // XP 획득 피드백 확인
    await expect(page.locator('[data-testid="xp-gained"]')).toBeVisible({ timeout: 3000 });
    
    // 프로필로 이동하여 XP 증가 확인
    await page.goto('/profile');
    const newXP = await page.locator('[data-testid="current-xp"]').textContent();
    
    expect(newXP).not.toBe(initialXP);
  });

  test('벚꽃 정원 업데이트 확인', async ({ page }) => {
    await page.goto('/profile');
    
    // 벚꽃 정원 표시 확인
    await expect(page.locator('[data-testid="blossom-garden"]')).toBeVisible();
    
    // 벚꽃 개수 확인
    const blossomCount = await page.locator('[data-testid="blossom-count"]').textContent();
    expect(blossomCount).toBeTruthy();
  });
});
