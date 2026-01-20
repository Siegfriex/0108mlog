import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages/ChatPage';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-003: AI 페르소나 기반 대화', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 3-1: 기본 페르소나 대화', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    // 감정 선택 및 대화 시작
    await chatPage.selectEmotion('joy');
    await chatPage.setIntensity(7);
    await chatPage.startChat();
    
    // 메시지 전송
    await chatPage.sendMessage('오늘 회사에서 스트레스를 받았어요');
    
    // AI 응답 확인
    await chatPage.waitForAIResponse(8000);
    const aiMessage = await page.locator('[data-testid="ai-message"]').first().textContent();
    
    // 페르소나 특성 반영 확인 (공감적 톤)
    expect(aiMessage).toMatch(/이해|공감|힘들|괜찮/);
    
    // 추가 메시지로 대화 히스토리 유지 확인
    await chatPage.sendMessage('좀 더 말하고 싶어요');
    await chatPage.waitForAIResponse(8000);
    
    // 맥락 유지 확인
    const secondMessage = await page.locator('[data-testid="ai-message"]').nth(1).textContent();
    expect(secondMessage).toBeTruthy();
  });

  test('시나리오 3-2: 커스텀 페르소나 대화', async ({ page }) => {
    // 페르소나 설정 페이지로 이동
    await page.goto('/profile/persona');
    
    // 페르소나 편집
    await page.locator('button:has-text("페르소나 편집")').click();
    
    // 이름 변경
    await page.locator('[data-testid="persona-name"]').fill('친구');
    
    // 말투 선택 (반말)
    await page.locator('[data-testid="speaking-style-casual"]').click();
    
    // 저장
    await page.locator('button:has-text("저장")').click();
    await page.waitForSelector('[data-testid="save-success"]', { timeout: 2000 });
    
    // 채팅으로 이동하여 확인
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    await chatPage.selectEmotion('joy');
    await chatPage.startChat();
    await chatPage.sendMessage('안녕');
    
    await chatPage.waitForAIResponse(8000);
    const aiMessage = await page.locator('[data-testid="ai-message"]').first().textContent();
    
    // 반말 톤 확인
    expect(aiMessage).toMatch(/야|어|해|니/);
  });
});
