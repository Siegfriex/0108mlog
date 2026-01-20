import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-013: Bibliotherapy (콘텐츠 매개 대화)', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 13-1: 콘텐츠 큐레이션 조회', async ({ page }) => {
    // 감정 체크인 완료 (슬픔)
    await page.goto('/chat');
    await page.locator('[data-testid="emotion-sadness"]').click();
    await page.locator('[data-testid="intensity-slider"]').fill('6');
    await page.locator('button:has-text("대화 시작하기")').click();
    
    // 콘텐츠 페이지로 이동
    await page.goto('/content');
    
    // 감정 상태에 맞는 콘텐츠 추천 확인
    await expect(page.locator('[data-testid="recommended-content"]')).toBeVisible();
    
    // "시" 카테고리 선택
    await page.locator('[data-testid="category-poems"]').click();
    
    // 시 목록 표시 확인
    await expect(page.locator('[data-testid="poem-list"]')).toBeVisible();
    
    // 특정 시 클릭
    await page.locator('[data-testid="poem-item"]').first().click();
    
    // 시 내용 표시 확인
    await expect(page.locator('[data-testid="poem-content"]')).toBeVisible();
    
    // "AI와 대화하기" 버튼 확인
    await expect(page.locator('button:has-text("AI와 대화하기")')).toBeVisible();
    
    // Bibliotherapy 세션 시작
    await page.locator('button:has-text("AI와 대화하기")').click();
    
    // 대화 화면으로 전환 확인
    await expect(page.locator('[data-testid="bibliotherapy-session"]')).toBeVisible();
  });
});
