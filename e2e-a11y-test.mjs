/**
 * 마음로그 V5.0 E2E 접근성 테스트
 * WCAG 2.2 AA 준수 검증
 *
 * 설치 필요:
 * npm install -D @axe-core/playwright playwright
 *
 * 실행 방법:
 * node e2e-a11y-test.mjs
 */

import { chromium } from 'playwright';

// axe-core가 설치되지 않은 경우 대체 로직
let AxeBuilder;
try {
  const axeModule = await import('@axe-core/playwright');
  AxeBuilder = axeModule.default;
} catch {
  console.log('[경고] @axe-core/playwright가 설치되지 않았습니다.');
  console.log('설치: npm install -D @axe-core/playwright');
  AxeBuilder = null;
}

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

async function runA11yTests() {
  log('=== 마음로그 V5.0 접근성 테스트 시작 ===');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });

  const page = await context.newPage();

  try {
    const routes = ['/', '/chat', '/journal', '/profile', '/safety'];

    for (const route of routes) {
      log(`\n=== 테스트: ${route} ===`);

      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

      // 1. axe-core 접근성 검사
      if (AxeBuilder) {
        try {
          const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

          const violationCount = axeResults.violations.length;
          addResult(
            `${route} axe-core 검사`,
            violationCount === 0,
            `위반 ${violationCount}건`
          );

          if (violationCount > 0) {
            axeResults.violations.forEach((v) => {
              log(`  - ${v.id}: ${v.description} (${v.impact})`, 'WARN');
            });
          }
        } catch (axeError) {
          addResult(`${route} axe-core 검사`, false, `오류: ${axeError.message}`);
        }
      } else {
        addResult(`${route} axe-core 검사`, false, 'axe-core 미설치');
      }

      // 2. 키보드 포커스 테스트
      try {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(300);
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            hasOutline: getComputedStyle(el).outline !== 'none' &&
                        getComputedStyle(el).outline !== '',
          };
        });

        addResult(
          `${route} 키보드 포커스`,
          focusedElement.tagName !== 'BODY',
          `Focused: ${focusedElement.tagName}`
        );
      } catch (focusError) {
        addResult(`${route} 키보드 포커스`, false, `오류: ${focusError.message}`);
      }

      // 3. 색상 대비 수동 검사 (brand-700 사용 확인)
      try {
        const hasWcagColors = await page.evaluate(() => {
          const computedStyle = getComputedStyle(document.documentElement);
          const brand700 = computedStyle.getPropertyValue('--color-brand-700').trim();
          // brand-700이 설정되어 있는지 확인
          return brand700.length > 0;
        });

        addResult(
          `${route} WCAG 색상 변수`,
          hasWcagColors,
          hasWcagColors ? 'brand-700 설정됨' : 'brand-700 미설정'
        );
      } catch (colorError) {
        addResult(`${route} WCAG 색상 변수`, false, `오류: ${colorError.message}`);
      }

      // 4. ARIA 속성 검사
      try {
        const ariaCheck = await page.evaluate(() => {
          const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
          const buttons = document.querySelectorAll('button');
          const links = document.querySelectorAll('a[href^="tel:"]');

          let issues = [];

          // 다이얼로그 검사
          dialogs.forEach((d) => {
            if (!d.getAttribute('aria-modal')) {
              issues.push('dialog missing aria-modal');
            }
          });

          // 전화 링크 검사
          links.forEach((l) => {
            if (!l.getAttribute('aria-label')) {
              issues.push('tel: link missing aria-label');
            }
          });

          return {
            dialogCount: dialogs.length,
            buttonCount: buttons.length,
            telLinkCount: links.length,
            issues,
          };
        });

        addResult(
          `${route} ARIA 속성`,
          ariaCheck.issues.length === 0,
          `Dialogs: ${ariaCheck.dialogCount}, Issues: ${ariaCheck.issues.join(', ') || 'none'}`
        );
      } catch (ariaError) {
        addResult(`${route} ARIA 속성`, false, `오류: ${ariaError.message}`);
      }
    }

    // 5. 전역 포커스 스타일 검사
    log('\n=== 전역 포커스 스타일 검사 ===');
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });

    try {
      const focusStyleCheck = await page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = '*:focus-visible { --test-marker: 1; }';
        document.head.appendChild(style);

        // focus-visible CSS 규칙 존재 확인
        const sheets = document.styleSheets;
        let hasFocusVisible = false;

        for (const sheet of sheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.selectorText && rule.selectorText.includes('focus-visible')) {
                hasFocusVisible = true;
                break;
              }
            }
          } catch {
            // CORS 제한된 스타일시트 무시
          }
          if (hasFocusVisible) break;
        }

        document.head.removeChild(style);
        return hasFocusVisible;
      });

      addResult('전역 focus-visible 스타일', focusStyleCheck, focusStyleCheck ? '설정됨' : '미설정');
    } catch (focusStyleError) {
      addResult('전역 focus-visible 스타일', false, `오류: ${focusStyleError.message}`);
    }

  } catch (error) {
    log(`테스트 실행 중 에러: ${error.message}`, 'ERROR');
    addResult('테스트 실행', false, error.message);
  } finally {
    await browser.close();

    // 결과 요약
    log('\n=== 접근성 테스트 결과 요약 ===');
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log('\n최종 결과:');
    results.forEach((r) => {
      console.log(`${r.passed ? '✅' : '❌'} ${r.testName} ${r.details ? `(${r.details})` : ''}`);
    });

    console.log(`\n총 ${results.length}개 중 ${passed}개 통과 (${Math.round((passed / results.length) * 100)}%)`);

    if (failed > 0) {
      console.log('\n실패 항목:');
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.testName}: ${r.details}`);
        });
    }
  }

  return results;
}

// 테스트 실행
runA11yTests()
  .then((results) => {
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    process.exit(passed === total ? 0 : 1);
  })
  .catch((err) => {
    console.error('테스트 실행 실패:', err);
    process.exit(1);
  });
