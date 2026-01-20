import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages/ChatPage';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';
import { measurePerformance, waitForSave } from '../../helpers/performance';
import { EMOTIONS, TEST_MESSAGES, PERFORMANCE_TARGETS } from '../../fixtures/test-data';

test.describe('FEAT-001: 대화형 감정 체크인 + Day/Night Mode', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 1-1: Day Mode 체크인 (정상 플로우)', async ({ page }) => {
    const chatPage = new ChatPage(page);
    
    // 1. /chat 경로 접근
    await chatPage.goto('/chat');
    
    // 2. Day Mode 화면 확인
    await expect(chatPage.page.locator('[data-testid="day-mode"]')).toBeVisible();
    
    // 3. 감정 선택 모달에서 "기쁨" 선택
    await chatPage.selectEmotion('joy');
    
    // 4. 강도 슬라이더 확인
    await expect(chatPage.intensitySlider).toBeVisible();
    
    // 5. 강도 7로 설정
    await chatPage.setIntensity(7);
    
    // 6. 대화 시작하기 버튼 클릭
    await chatPage.startChat();
    
    // 7. 채팅 인터페이스 표시 확인 및 AI 인사 메시지 (3초 이내)
    await chatPage.waitForAIResponse(3000);
    
    // 8. 메시지 입력 및 전송
    await chatPage.sendMessage(TEST_MESSAGES.DAY_MODE);
    
    // 9. AI 응답 (8초 이내)
    const aiResponseTime = await measurePerformance(page, async () => {
      await chatPage.waitForAIResponse(8000);
    });
    expect(aiResponseTime).toBeLessThan(PERFORMANCE_TARGETS.AI_INSIGHT);
    
    // 10-11. 퀵 칩 선택 및 대화 이어짐 확인
    await page.locator('[data-testid="quick-chip"]:has-text("더 말해보기")').click();
    await chatPage.waitForAIResponse(8000);
    
    // 12. 완료 버튼 클릭
    await page.locator('button:has-text("완료")').click();
    
    // 13. 상황 태그 선택 모달 표시 확인
    await expect(page.locator('[data-testid="context-tag-modal"]')).toBeVisible();
    
    // 14. 상황 태그 2개 선택
    await page.locator('[data-testid="tag-home"]').click();
    await page.locator('[data-testid="tag-alone"]').click();
    
    // 15. 저장하기 버튼 클릭
    const saveTime = await waitForSave(page, PERFORMANCE_TARGETS.SAVE_FEEDBACK);
    
    // 16. 저장 성공 피드백 확인 (P95 < 800ms)
    expect(saveTime).toBeLessThan(PERFORMANCE_TARGETS.SAVE_FEEDBACK);
    
    // 17. 마이크로 액션 제안 확인
    await expect(page.locator('[data-testid="micro-action-card"]')).toBeVisible();
    
    // 18. 타임라인에 새로운 감정 기록 추가 확인
    await page.goto('/journal');
    await expect(page.locator('[data-testid="timeline-entry"]').first()).toBeVisible();
  });

  test('시나리오 1-2: Night Mode 체크인 (정상 플로우)', async ({ page }) => {
    // Night Mode 강제 설정
    await page.evaluate(() => {
      localStorage.setItem('mode_override', 'night');
    });
    
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    // Night Mode 화면 확인
    await expect(page.locator('[data-testid="night-mode"]')).toBeVisible();
    
    // 감정 선택
    await chatPage.selectEmotion('anxiety');
    
    // 일기 작성 단계 확인
    await expect(page.locator('[data-testid="diary-textarea"]')).toBeVisible();
    
    // 일기 작성
    await page.locator('[data-testid="diary-textarea"]').fill(TEST_MESSAGES.NIGHT_MODE);
    
    // 분석하기 버튼 클릭
    await page.locator('button:has-text("분석하기")').click();
    
    // AI 분석 (8초 이내)
    const analysisTime = await measurePerformance(page, async () => {
      await page.waitForSelector('[data-testid="ai-analysis"]', { timeout: 8000 });
    });
    expect(analysisTime).toBeLessThan(8000);
    
    // AI 공감 및 인사이트 확인
    await expect(page.locator('[data-testid="ai-analysis"]')).toContainText(/공감|감정|스트레스/);
    
    // 저장하기
    await page.locator('button:has-text("저장하기")').click();
    await waitForSave(page, 800);
    
    // 타임라인 확인
    await page.goto('/journal');
    await expect(page.locator('[data-testid="timeline-entry"]').first()).toBeVisible();
  });

  test('시나리오 1-3: 위기 감지 플로우', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    // 감정 선택 (슬픔, 강도 10)
    await chatPage.selectEmotion('sadness');
    await chatPage.setIntensity(10);
    await chatPage.startChat();
    
    // 위기 메시지 입력
    await chatPage.sendMessage(TEST_MESSAGES.CRISIS);
    
    // Safety 화면으로 자동 리다이렉트 확인
    await page.waitForURL('**/safety', { timeout: 10000 });
    
    // 위기 대응 화면 표시 확인
    await expect(page.locator('[data-testid="crisis-support"]')).toBeVisible();
    
    // 긴급 연락처 정보 표시 확인
    await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();
  });

  test('시나리오 1-4: 네트워크 오류 처리', async ({ page, context }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto('/chat');
    
    // 네트워크 오프라인 시뮬레이션
    await context.setOffline(true);
    
    // 메시지 전송 시도
    await chatPage.selectEmotion('joy');
    await chatPage.startChat();
    await chatPage.sendMessage('테스트 메시지');
    
    // 폴백 메시지 또는 오류 표시 확인
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    
    // 재시도 버튼 확인
    await expect(page.locator('button:has-text("재시도")')).toBeVisible();
    
    // 네트워크 복구
    await context.setOffline(false);
    
    // 재시도 클릭
    await page.locator('button:has-text("재시도")').click();
    
    // 정상 동작 확인
    await chatPage.waitForAIResponse(8000);
  });
});
