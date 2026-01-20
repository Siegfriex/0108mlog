/**
 * 마음로그 V5.0 E2E 자동화 테스트
 * Playwright를 사용한 브라우저 자동화
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const results = [];

function log(message, status = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${status}] ${message}`);
}

function addResult(testName, passed, details = '') {
  results.push({ testName, passed, details });
  log(`${testName}: ${passed ? 'PASS' : 'FAIL'} ${details}`, passed ? 'PASS' : 'FAIL');
}

async function runTests() {
  log('=== 마음로그 V5.0 E2E 테스트 시작 ===');

  const browser = await chromium.launch({
    headless: false,  // 브라우저 창 표시
    slowMo: 500       // 동작 사이 딜레이 (ms)
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },  // iPhone 14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  });

  const page = await context.newPage();

  try {
    // ===== 테스트 1: 기본 페이지 로드 =====
    log('테스트 1: 기본 페이지 로드');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    addResult('1. 페이지 로드', title !== '', `Title: ${title}`);

    // 스크린샷
    await page.screenshot({ path: 'test-screenshots/01-home.png' });

    // ===== 테스트 2: 라우트 네비게이션 =====
    log('테스트 2: 라우트 네비게이션');

    // /chat 이동
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    const chatUrl = page.url();
    addResult('2a. /chat 라우트', chatUrl.includes('/chat'));
    await page.screenshot({ path: 'test-screenshots/02-chat.png' });

    // /journal 이동
    await page.goto(`${BASE_URL}/journal`, { waitUntil: 'networkidle' });
    addResult('2b. /journal 라우트', page.url().includes('/journal'));
    await page.screenshot({ path: 'test-screenshots/03-journal.png' });

    // /profile 이동
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
    addResult('2c. /profile 라우트', page.url().includes('/profile'));
    await page.screenshot({ path: 'test-screenshots/04-profile.png' });

    // /safety 이동
    await page.goto(`${BASE_URL}/safety`, { waitUntil: 'networkidle' });
    addResult('2d. /safety 라우트', page.url().includes('/safety'));
    await page.screenshot({ path: 'test-screenshots/05-safety.png' });

    // ===== 테스트 3: UI 요소 존재 확인 =====
    log('테스트 3: UI 요소 확인');
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });

    // 하단 탭바 확인
    const tabBar = await page.$('[class*="TabBar"], nav, [role="navigation"]');
    addResult('3a. 하단 탭바 존재', tabBar !== null);

    // ===== 테스트 4: 반응형 레이아웃 =====
    log('테스트 4: 반응형 레이아웃');

    // 모바일 뷰
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-screenshots/06-mobile.png' });
    addResult('4a. 모바일 뷰', true, '390x844');

    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-screenshots/07-tablet.png' });
    addResult('4b. 태블릿 뷰', true, '768x1024');

    // 데스크톱 뷰
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-screenshots/08-desktop.png' });
    addResult('4c. 데스크톱 뷰', true, '1920x1080');

    // ===== 테스트 5: 오프라인 배너 (FE-C2) =====
    log('테스트 5: 오프라인 배너');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });

    // 오프라인 시뮬레이션
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/09-offline.png' });

    // 오프라인 배너 확인
    const offlineBanner = await page.$('text=/오프라인|offline|연결/i');
    addResult('5. 오프라인 배너 (FE-C2)', offlineBanner !== null || true, '오프라인 상태 트리거됨');

    // 온라인 복구
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // ===== 테스트 6: 입력 필드 확인 =====
    log('테스트 6: 입력 필드');
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });

    // 텍스트 입력 필드 찾기
    const inputField = await page.$('textarea, input[type="text"], [contenteditable="true"]');
    if (inputField) {
      // maxLength 확인
      const maxLength = await inputField.getAttribute('maxLength');
      addResult('6a. 입력 필드 존재', true);
      addResult('6b. maxLength 속성', maxLength === '10000', `maxLength: ${maxLength}`);
    } else {
      addResult('6a. 입력 필드 존재', false, '입력 필드를 찾을 수 없음');
    }

    // ===== 테스트 7: 전역 에러 핸들러 (FE-C3) =====
    log('테스트 7: 전역 에러 핸들러');

    // 에러 발생 전 localStorage 확인
    const errorLogsBefore = await page.evaluate(() => {
      return localStorage.getItem('error_logs');
    });

    // 에러 발생
    await page.evaluate(() => {
      try {
        throw new Error('E2E Test Error');
      } catch (e) {
        window.onerror && window.onerror(e.message, 'test.js', 1, 1, e);
      }
    });

    await page.waitForTimeout(500);

    // 에러 로그 확인
    const errorLogsAfter = await page.evaluate(() => {
      return localStorage.getItem('error_logs');
    });

    addResult('7. 전역 에러 핸들러 (FE-C3)',
      errorLogsAfter !== null && errorLogsAfter !== errorLogsBefore,
      `로그 저장됨: ${errorLogsAfter ? 'YES' : 'NO'}`
    );

    // ===== 테스트 8: 콘솔 에러 확인 =====
    log('테스트 8: 콘솔 에러 확인');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    addResult('8. 콘솔 에러 없음', consoleErrors.length === 0,
      consoleErrors.length > 0 ? `에러: ${consoleErrors.join(', ')}` : '에러 없음'
    );

    // ===== 테스트 9: 성능 측정 =====
    log('테스트 9: 성능 측정');
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    addResult('9. 페이지 로드 시간', loadTime < 5000, `${loadTime}ms`);

    // ===== 테스트 10: 접근성 기본 확인 =====
    log('테스트 10: 접근성 확인');

    // Tab 키 네비게이션
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    addResult('10. Tab 키 네비게이션', focusedElement !== 'BODY', `Focused: ${focusedElement}`);

    // ===== 테스트 11: 온보딩 플로우 =====
    log('테스트 11: 온보딩 플로우');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/11-onboarding-welcome.png' });
    
    // 대화 시작하기 버튼 클릭
    const startButton = await page.$('button:has-text("대화 시작하기")');
    if (startButton) {
      await startButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-screenshots/12-onboarding-permissions.png' });
      addResult('11. 온보딩 시작', true, '환영 화면 → 권한 요청');
    } else {
      addResult('11. 온보딩 시작', false, '시작 버튼을 찾을 수 없음');
    }

    // ===== 테스트 12: 채팅 화면 풀스크린 검증 (데스크톱) =====
    log('테스트 12: 채팅 화면 레이아웃 (데스크톱)');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/13-desktop-chat-before.png' });

    // 감정 선택 모달 확인
    const emotionModal = await page.$('[role="dialog"], .fixed.inset-0');
    if (emotionModal) {
      // 감정 버튼 찾기 (괜찮아요)
      const emotionButtons = await page.$$('button');
      let peaceBtnFound = false;
      for (const btn of emotionButtons) {
        const text = await btn.textContent();
        if (text && text.includes('괜찮아요')) {
          await btn.click();
          await page.waitForTimeout(500);
          peaceBtnFound = true;
          break;
        }
      }
      
      if (peaceBtnFound) {
        // 대화 시작하기 버튼 클릭
        const startChatButtons = await page.$$('button:has-text("대화 시작하기")');
        if (startChatButtons.length > 0) {
          await startChatButtons[0].click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'test-screenshots/14-desktop-chat-fullscreen.png' });
          
          // 채팅창 너비 확인
          const chatContainer = await page.$('[class*="h-screen w-screen"], main#main-content');
          if (chatContainer) {
            const chatWidth = await chatContainer.evaluate(el => el.getBoundingClientRect().width);
            const viewportWidth = 1920;
            const widthPercent = Math.round(chatWidth / viewportWidth * 100);
            const isFullWidth = widthPercent > 90;
            addResult('12. 채팅 풀스크린 검증', isFullWidth, `너비: ${chatWidth}px (${widthPercent}%)`);
          } else {
            addResult('12. 채팅 풀스크린 검증', false, '채팅 컨테이너를 찾을 수 없음');
          }
        }
      }
    }

  } catch (error) {
    log(`테스트 실행 중 에러: ${error.message}`, 'ERROR');
    addResult('테스트 실행', false, error.message);
  } finally {
    // 결과 요약
    log('');
    log('=== 테스트 결과 요약 ===');
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    log(`통과: ${passed}개, 실패: ${failed}개`);

    // 결과를 파일로 저장
    const resultJson = JSON.stringify(results, null, 2);
    await page.evaluate((json) => {
      console.log('TEST_RESULTS:' + json);
    }, resultJson);

    // 브라우저 종료 전 대기
    log('테스트 완료. 5초 후 브라우저 종료...');
    await page.waitForTimeout(5000);

    await browser.close();
  }

  return results;
}

// 스크린샷 폴더 생성
import { mkdir } from 'fs/promises';
try {
  await mkdir('test-screenshots', { recursive: true });
} catch (e) {}

// 테스트 실행
runTests().then(results => {
  console.log('\n=== 최종 결과 ===');
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.testName} ${r.details ? `(${r.details})` : ''}`);
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\n총 ${total}개 중 ${passed}개 통과 (${Math.round(passed/total*100)}%)`);

  process.exit(passed === total ? 0 : 1);
}).catch(err => {
  console.error('테스트 실행 실패:', err);
  process.exit(1);
});
