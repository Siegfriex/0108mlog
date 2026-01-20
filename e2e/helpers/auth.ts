import { Page } from '@playwright/test';

export async function ensureAuthenticated(page: Page) {
  // AuthLoadingScreen이 사라질 때까지 대기 (최대 5초)
  try {
    await page.waitForSelector('[data-testid="auth-loading"]', { state: 'hidden', timeout: 5000 });
  } catch {
    // 로딩 화면이 없으면 이미 인증된 상태
  }
  
  // 추가로 2초 대기하여 Firebase 완전 초기화 보장
  await page.waitForTimeout(2000);
}

export async function skipOnboarding(page: Page) {
  // 먼저 페이지를 로드하여 localStorage 접근 가능하게 함
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  const onboardingComplete = await page.evaluate(() => {
    try {
      return localStorage.getItem('onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  if (!onboardingComplete) {
    await page.evaluate(() => {
      try {
        localStorage.setItem('onboarding_complete', 'true');
      } catch (e) {
        console.error('Failed to set localStorage:', e);
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
}
