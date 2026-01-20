import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-014: 감각적 몰입 및 사회적 연대', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('콘텐츠 몰입 모드', async ({ page }) => {
    await page.goto('/content/immersion');
    
    // 몰입 모드 화면 표시 확인
    await expect(page.locator('[data-testid="immersion-view"]')).toBeVisible();
    
    // TTS 재생 버튼 확인
    await expect(page.locator('[data-testid="voice-player"]')).toBeVisible();
    
    // 재생 버튼 클릭
    await page.locator('[data-testid="play-button"]').click();
    
    // 재생 중 상태 확인
    await expect(page.locator('[data-testid="playing-indicator"]')).toBeVisible({ timeout: 2000 });
    
    // 일시정지 버튼 클릭
    await page.locator('[data-testid="pause-button"]').click();
    
    // 일시정지 상태 확인
    await expect(page.locator('[data-testid="paused-indicator"]')).toBeVisible();
  });

  test('익명 연대 기능', async ({ page }) => {
    await page.goto('/content/immersion');
    
    // 커뮤니티 탭 선택
    await page.locator('[data-testid="tab-community"]').click();
    
    // 익명 연대 메시지 목록 표시 확인
    await expect(page.locator('[data-testid="solidarity-messages"]')).toBeVisible();
    
    // 연대 메시지 작성
    await page.locator('[data-testid="solidarity-input"]').fill('힘내세요!');
    await page.locator('button:has-text("전송")').click();
    
    // 전송 성공 피드백 확인
    await expect(page.locator('[data-testid="message-sent"]')).toBeVisible({ timeout: 2000 });
  });
});
