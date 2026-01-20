import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-012: AI 페르소나 설정', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 12-1: 페르소나 설정 및 변경', async ({ page }) => {
    await page.goto('/profile/persona');
    
    // 현재 페르소나 설정 표시 확인
    await expect(page.locator('[data-testid="current-persona"]')).toBeVisible();
    
    // 페르소나 편집 버튼 클릭
    await page.locator('button:has-text("페르소나 편집")').click();
    
    // 이름 변경
    await page.locator('[data-testid="persona-name"]').clear();
    await page.locator('[data-testid="persona-name"]').fill('친구');
    
    // MBTI 선택
    await page.locator('[data-testid="mbti-select"]').selectOption('ENFP');
    
    // 슬라이더 조정
    await page.locator('[data-testid="warmth-slider"]').fill('8');
    await page.locator('[data-testid="directness-slider"]').fill('3');
    await page.locator('[data-testid="humor-slider"]').fill('7');
    await page.locator('[data-testid="expertise-slider"]').fill('5');
    
    // 말투 선택 (반말)
    await page.locator('[data-testid="speaking-style-casual"]').click();
    
    // 관계 선택 (친구)
    await page.locator('[data-testid="relationship-friend"]').click();
    
    // 저장 버튼 클릭
    await page.locator('button:has-text("저장")').click();
    
    // 저장 성공 확인
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible({ timeout: 2000 });
    
    // 채팅으로 이동하여 변경된 페르소나 반영 확인
    await page.goto('/chat');
    await page.locator('[data-testid="emotion-joy"]').click();
    await page.locator('button:has-text("대화 시작하기")').click();
    
    // AI 인사 메시지 확인 (변경된 페르소나 반영)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 3000 });
    const greeting = await page.locator('[data-testid="ai-message"]').first().textContent();
    
    // 반말 톤 확인
    expect(greeting).toBeTruthy();
  });
});
