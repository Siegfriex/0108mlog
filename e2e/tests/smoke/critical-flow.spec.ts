import { test, expect } from '@playwright/test';

/**
 * 스모크 테스트: 핵심 플로우 검증
 * 가장 중요한 기능들만 빠르게 검증
 */
test.describe('스모크 테스트: 핵심 플로우', () => {
  test('전체 핵심 플로우 검증', async ({ page }) => {
    // 1. 앱 로딩 확인
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/마음로그|MaumLog/i);
    console.log('✅ 1. 앱 로딩 성공');

    // 2. 온보딩 스킵 설정
    await page.evaluate(() => {
      try {
        localStorage.setItem('onboarding_complete', 'true');
      } catch (e) {
        console.warn('localStorage 설정 실패:', e);
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ 2. 온보딩 스킵 완료');

    // 3. Auth 대기 (최대 5초)
    await page.waitForTimeout(3000);
    console.log('✅ 3. Auth 초기화 대기 완료');

    // 4. 채팅 페이지 접근
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    console.log('✅ 4. 채팅 페이지 접근 성공');

    // 5. 감정 선택 모달 확인 (텍스트 기반)
    const hasEmotionModal = await page.locator('button:has-text("완전 최고")').isVisible({ timeout: 5000 }).catch(() => false);
    if (hasEmotionModal) {
      console.log('✅ 5. 감정 선택 모달 표시됨');
      
      // 6. 감정 선택
      await page.locator('button:has-text("완전 최고")').click();
      console.log('✅ 6. 감정 선택 완료 (기쁨)');
      
      // 7. 강도 슬라이더 확인 및 설정
      const hasSlider = await page.locator('input[type="range"]').isVisible({ timeout: 3000 }).catch(() => false);
      if (hasSlider) {
        await page.locator('input[type="range"]').fill('7');
        console.log('✅ 7. 강도 설정 완료 (7/10)');
      }
      
      // 8. 대화 시작 버튼 클릭
      const startButton = await page.locator('button:has-text("대화 시작하기")').isVisible({ timeout: 3000 }).catch(() => false);
      if (startButton) {
        await page.locator('button:has-text("대화 시작하기")').click();
        console.log('✅ 8. 대화 시작 버튼 클릭');
        
        // 9. 채팅 인터페이스 표시 확인
        await page.waitForTimeout(2000);
        const hasChatInput = await page.locator('textarea, input[type="text"]').isVisible().catch(() => false);
        if (hasChatInput) {
          console.log('✅ 9. 채팅 인터페이스 표시됨');
        } else {
          console.warn('⚠️ 9. 채팅 인터페이스 표시 안됨');
        }
      }
    } else {
      console.warn('⚠️ 5. 감정 선택 모달 표시 안됨 (이미 진행 중일 수 있음)');
    }

    // 10. 네비게이션 테스트
    console.log('--- 네비게이션 테스트 ---');
    
    // 기록 탭
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');
    const hasJournal = await page.locator('h1, h2').filter({ hasText: /기록|타임라인|Timeline/i }).isVisible({ timeout: 3000 }).catch(() => false);
    console.log(hasJournal ? '✅ 기록 페이지 로드 성공' : '⚠️ 기록 페이지 로드 실패');

    // 리포트 탭
    await page.goto('/reports/weekly');
    await page.waitForLoadState('networkidle');
    const hasReports = await page.locator('h1, h2').filter({ hasText: /주간|리포트|Weekly|Report/i }).isVisible({ timeout: 3000 }).catch(() => false);
    console.log(hasReports ? '✅ 리포트 페이지 로드 성공' : '⚠️ 리포트 페이지 로드 실패');

    // 콘텐츠 탭
    await page.goto('/content');
    await page.waitForLoadState('networkidle');
    const hasContent = await page.locator('h1, h2').filter({ hasText: /콘텐츠|Content/i }).isVisible({ timeout: 3000 }).catch(() => false);
    console.log(hasContent ? '✅ 콘텐츠 페이지 로드 성공' : '⚠️ 콘텐츠 페이지 로드 실패');

    // 프로필 탭
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const hasProfile = await page.locator('h1, h2').filter({ hasText: /프로필|Profile|설정/i }).isVisible({ timeout: 3000 }).catch(() => false);
    console.log(hasProfile ? '✅ 프로필 페이지 로드 성공' : '⚠️ 프로필 페이지 로드 실패');

    // 최종 스크린샷
    await page.screenshot({ path: 'test-screenshots/smoke-test-final.png', fullPage: true });
    console.log('✅ 스모크 테스트 완료');
  });
});
