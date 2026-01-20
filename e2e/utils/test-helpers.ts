import { Page } from '@playwright/test';

/**
 * 시간 기반 모드 강제 설정
 */
export async function setTimeBasedMode(page: Page, mode: 'day' | 'night') {
  await page.evaluate((m) => {
    localStorage.setItem('mode_override', m);
  }, mode);
}

/**
 * 테스트용 감정 체크인 데이터 생성
 */
export async function createMockEmotionEntry(page: Page, count: number = 5) {
  await page.evaluate((n) => {
    const mockEntries = [];
    for (let i = 0; i < n; i++) {
      mockEntries.push({
        id: `mock-${i}`,
        emotion: ['joy', 'peace', 'anxiety', 'sadness', 'anger'][i % 5],
        intensity: Math.floor(Math.random() * 10) + 1,
        timestamp: Date.now() - i * 86400000, // 하루씩 과거
      });
    }
    localStorage.setItem('mock_emotion_entries', JSON.stringify(mockEntries));
  }, count);
}

/**
 * 네트워크 상태 시뮬레이션
 */
export async function simulateNetworkError(page: Page) {
  await page.route('**/*', route => route.abort());
}

export async function restoreNetwork(page: Page) {
  await page.unroute('**/*');
}

/**
 * 성능 측정 헬퍼
 */
export async function measureLoadTime(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return performance.now();
  });
}
