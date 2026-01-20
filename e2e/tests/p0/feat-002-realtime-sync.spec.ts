import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-002: 실시간 데이터 동기화', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 2-1: 실시간 동기화 검증', async ({ page }) => {
    // 감정 체크인 완료
    await page.goto('/chat');
    await page.locator('[data-testid="emotion-joy"]').click();
    await page.locator('[data-testid="intensity-slider"]').fill('7');
    await page.locator('button:has-text("대화 시작하기")').click();
    
    // 메시지 전송
    await page.locator('textarea[placeholder*="말씀해주세요"]').fill('테스트 메시지');
    await page.locator('[aria-label="전송"]').click();
    
    // AI 응답 대기
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 8000 });
    
    // 타임라인으로 이동
    await page.goto('/journal');
    
    // 새로운 기록이 실시간으로 표시되는지 확인 (지연 시간 < 1초)
    const start = Date.now();
    await expect(page.locator('[data-testid="timeline-entry"]').first()).toBeVisible({ timeout: 2000 });
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(1000);
  });

  test('시나리오 2-2: 오프라인 모드 검증', async ({ page, context }) => {
    await page.goto('/chat');
    
    // 네트워크 연결 끊기
    await context.setOffline(true);
    
    // 감정 체크인 시도
    await page.locator('[data-testid="emotion-joy"]').click();
    
    // 오프라인 상태 표시 확인
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({ timeout: 3000 });
    
    // 네트워크 연결 복구
    await context.setOffline(false);
    
    // 자동 동기화 확인 (온라인 상태로 복귀)
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible({ timeout: 3000 });
  });
});
