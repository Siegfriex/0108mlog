import { test, expect } from '@playwright/test';
import { ensureAuthenticated, skipOnboarding } from '../../helpers/auth';

test.describe('FEAT-005: 기록 관리', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
    await skipOnboarding(page);
  });

  test('시나리오 5-1: 타임라인 조회', async ({ page }) => {
    await page.goto('/journal');
    
    // 타임라인 표시 확인
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
    
    // 날짜별 그룹화 확인
    await expect(page.locator('[data-testid="date-divider"]')).toBeVisible();
    
    // 감정 아이콘 및 강도 표시 확인
    await expect(page.locator('[data-testid="emotion-icon"]')).toBeVisible();
    await expect(page.locator('[data-testid="intensity-badge"]')).toBeVisible();
    
    // 특정 기록 클릭
    await page.locator('[data-testid="timeline-entry"]').first().click();
    
    // 상세 화면 이동 확인
    await page.waitForURL('**/journal/detail/**');
    
    // 대화 내용 표시 확인
    await expect(page.locator('[data-testid="conversation-detail"]')).toBeVisible();
  });

  test('시나리오 5-2: 기록 검색', async ({ page }) => {
    await page.goto('/journal/search');
    
    // 검색어 입력
    await page.locator('[data-testid="search-input"]').fill('스트레스');
    
    // 검색 결과 필터링 확인
    const entries = page.locator('[data-testid="search-result"]');
    await expect(entries.first()).toContainText('스트레스');
    
    // 감정 필터 선택
    await page.locator('[data-testid="emotion-filter-anxiety"]').click();
    
    // 필터 적용 확인
    await expect(page.locator('[data-testid="filter-badge"]')).toContainText('불안');
    
    // 날짜 범위 선택
    await page.locator('[data-testid="date-range-picker"]').click();
    // 날짜 선택 로직은 실제 구현에 맞게 조정 필요
  });
});
