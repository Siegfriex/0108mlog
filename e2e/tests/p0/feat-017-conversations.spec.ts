import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-017: 대화 저장/삭제', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 17-1: 대화 저장/삭제 관리', async ({ page }) => {
    // 먼저 감정 체크인 완료 (대화 생성)
    await page.goto('/chat');
    await page.locator('[data-testid="emotion-joy"]').click();
    await page.locator('[data-testid="intensity-slider"]').fill('7');
    await page.locator('button:has-text("대화 시작하기")').click();
    
    await page.locator('textarea[placeholder*="말씀해주세요"]').fill('테스트 대화');
    await page.locator('[aria-label="전송"]').click();
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 8000 });
    
    // 대화 관리 페이지로 이동
    await page.goto('/profile/conversations');
    
    // 저장된 대화 목록 표시 확인
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible();
    
    // 특정 대화 선택
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // 대화 상세 내용 표시 확인
    await expect(page.locator('[data-testid="conversation-detail"]')).toBeVisible();
    
    // 삭제 버튼 클릭
    await page.locator('button:has-text("삭제")').click();
    
    // 삭제 확인 다이얼로그 표시 확인
    await expect(page.locator('[data-testid="delete-confirm-dialog"]')).toBeVisible();
    
    // 확인 버튼 클릭
    await page.locator('button:has-text("확인")').click();
    
    // 대화 삭제 확인
    await expect(page.locator('[data-testid="delete-success"]')).toBeVisible({ timeout: 2000 });
    
    // 목록에서 제거되었는지 확인
    await page.goto('/profile/conversations');
    // 삭제된 대화가 더 이상 표시되지 않음
  });
});
