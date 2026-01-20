import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages/ChatPage';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-009: 마이크로 액션', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('마이크로 액션 제안 및 완료', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    // 감정 체크인 완료
    await chatPage.selectEmotion('anxiety');
    await chatPage.setIntensity(6);
    await chatPage.startChat();
    
    await chatPage.sendMessage('오늘 불안해요');
    await chatPage.waitForAIResponse(8000);
    
    // 마이크로 액션 제안 확인
    await expect(page.locator('[data-testid="micro-action-card"]')).toBeVisible({ timeout: 5000 });
    
    // 액션 상세 내용 확인
    const actionTitle = await page.locator('[data-testid="action-title"]').textContent();
    expect(actionTitle).toBeTruthy();
    
    // "완료" 버튼 클릭
    await page.locator('button:has-text("완료")').click();
    
    // Before/After 평가 모달 표시 확인
    await expect(page.locator('[data-testid="before-after-modal"]')).toBeVisible();
    
    // Before 점수 입력
    await page.locator('[data-testid="before-rating"]').click();
    await page.locator('[data-testid="rating-5"]').click();
    
    // After 점수 입력
    await page.locator('[data-testid="after-rating"]').click();
    await page.locator('[data-testid="rating-7"]').click();
    
    // 제출
    await page.locator('button:has-text("제출")').click();
    
    // 완료 피드백 확인
    await expect(page.locator('[data-testid="action-complete-feedback"]')).toBeVisible();
  });

  test('마이크로 액션 패스', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    await chatPage.selectEmotion('joy');
    await chatPage.startChat();
    
    // 마이크로 액션 카드 표시 대기
    await expect(page.locator('[data-testid="micro-action-card"]')).toBeVisible({ timeout: 5000 });
    
    // "오늘은 패스" 버튼 클릭
    await page.locator('button:has-text("오늘은 패스")').click();
    
    // 액션이 숨겨지는지 확인
    await expect(page.locator('[data-testid="micro-action-card"]')).not.toBeVisible({ timeout: 2000 });
  });
});
