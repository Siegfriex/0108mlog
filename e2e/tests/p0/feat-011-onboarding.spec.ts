import { test, expect } from '@playwright/test';

test.describe('FEAT-011: 온보딩', () => {
  test.beforeEach(async ({ page }) => {
    // 온보딩 미완료 상태로 설정
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('onboarding_complete');
    });
  });

  test('시나리오 11-1: 전체 온보딩 플로우', async ({ page }) => {
    await page.goto('/');
    
    // 1단계: 환영 화면
    await expect(page.locator('h2:has-text("환영합니다")')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('1/6');
    await page.locator('button:has-text("시작하기")').click();
    
    // 2단계: 권한 요청
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('2/6');
    await page.locator('button:has-text("다음")').click();
    
    // 3단계: 초기 평가 (3개 질문)
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('3/6');
    
    // 질문 1: 감정 상태 (5점 척도)
    await page.locator('[data-testid="emotion-rating-4"]').click();
    
    // 질문 2: 필요한 도움 (다중 선택)
    await page.locator('[data-testid="help-option-1"]').click();
    await page.locator('[data-testid="help-option-3"]').click();
    
    // 질문 3: 체크인 목표 (단일 선택)
    await page.locator('[data-testid="goal-option-2"]').click();
    
    await page.locator('button:has-text("다음")').click();
    
    // 4단계: 목표 설정
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('4/6');
    await page.locator('[data-testid="goal-card-1"]').click();
    await page.locator('button:has-text("다음")').click();
    
    // 5단계: 개인화 설정
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('5/6');
    await page.locator('[data-testid="notification-time"]').fill('09:00');
    await page.locator('button:has-text("다음")').click();
    
    // 6단계: 첫 체크인 가이드
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('6/6');
    await page.locator('button:has-text("시작하기")').click();
    
    // 채팅 화면으로 이동 확인
    await page.waitForURL('**/chat');
    
    // 온보딩 완료 상태 저장 확인
    const onboardingComplete = await page.evaluate(() => {
      return localStorage.getItem('onboarding_complete') === 'true';
    });
    expect(onboardingComplete).toBe(true);
  });

  test('시나리오 11-2: 온보딩 스킵', async ({ page }) => {
    await page.goto('/onboarding');
    
    // 3단계에서 건너뛰기
    await page.locator('button:has-text("시작하기")').click(); // 1단계
    await page.locator('button:has-text("다음")').click(); // 2단계
    await page.locator('button:has-text("건너뛰기")').click(); // 3단계
    
    // 4단계로 이동 확인
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('4/6');
    
    // 기본값 적용 확인
    await page.locator('button:has-text("건너뛰기")').click(); // 4단계
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('5/6');
  });
});
