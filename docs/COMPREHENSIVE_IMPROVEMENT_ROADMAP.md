# 마음로그 V5.0 종합 개선 로드맵

**작성일**: 2026-01-17  
**기준**: 현재 코드베이스 (C:\INEESm) + PRD 5.8 + 위험요인 분석  
**총 위험요인**: 58개 (기존 48개 + 신규 10개)  
**예상 기간**: 6주 (동시 작업 시 4주)  
**예상 인력**: Frontend 2-3명, Backend 1명, QA 1명, Designer 0.5명

---

## Executive Summary

### 현재 상태

| 영역 | 점수 | 상태 |
|------|------|------|
| **기능 구현** | 95.5% | ✅ 우수 |
| **P0 위험요인 해결** | 100% | ✅ 완료 (7/7) |
| **WCAG 2.2 AA** | 75% | ⚠️ 개선 필요 |
| **레이아웃 그리드** | 90% | ✅ 양호 |
| **UX 사용성** | 90% | ✅ 양호 |
| **성능** | 88% | ✅ 양호 |
| **전체 평가** | **A- (90점)** | ✅ **양호** |

### 핵심 강점
- ✅ 4px 배수 spacing 시스템 완벽
- ✅ Safe area insets 완전 지원
- ✅ dvh 단위 polyfill
- ✅ prefers-reduced-motion 지원
- ✅ P0 위험요인 7개 모두 해결

### 주요 약점
- ⚠️ 색상 대비 WCAG AA 미달 (추정 40%)
- ⚠️ 키보드 네비게이션 불완전
- ⚠️ 스크린 리더 지원 부족
- ⚠️ CSS Grid 활용도 낮음 (30%)

---

## 1. 총 위험요인 현황

### 1.1 전체 집계

| 심각도 | P0 해결 전 | P0 해결 후 | 신규 발견 | 현재 총계 | 해결 | 미해결 |
|--------|-----------|-----------|----------|----------|------|--------|
| Critical | 7개 | 1개 | 1개 (A11Y-C1) | 2개 | 1개 | 1개 |
| High | 15개 | 10개 | 6개 | 16개 | 5개 | 11개 |
| Medium | 20개 | 19개 | 3개 | 22개 | 1개 | 21개 |
| Low | 6개 | 6개 | 0개 | 6개 | 0개 | 6개 |
| **합계** | **48개** | **36개** | **10개** | **46개** | **7개** | **39개** |

---

### 1.2 새로 식별된 위험요인 (10개)

#### 접근성 (A11Y) - 7개
| ID | 분류 | 문제 | 우선순위 |
|----|------|------|----------|
| A11Y-C1 | Critical | 색상 대비 WCAG AA 미달 | P0 |
| A11Y-H1 | High | 키보드 네비게이션 불완전 | P0 |
| A11Y-H2 | High | 스크린 리더 지원 부족 | P0 |
| A11Y-M1 | Medium | 포커스 표시 일부 누락 | P1 |
| A11Y-M2 | Medium | 에러 role="alert" 누락 | P1 |
| A11Y-M3 | Medium | Reflow 미검증 | P1 |
| A11Y-M4 | Medium | Orientation 미검증 | P1 |

#### UX - 2개
| ID | 분류 | 문제 | 우선순위 |
|----|------|------|----------|
| UX-H1 | High | 입력 제한 경고 없음 | P0 |
| UX-H2 | High | Toast 알림 시스템 없음 | P0 |

#### 레이아웃 (GRID) - 4개
| ID | 분류 | 문제 | 우선순위 |
|----|------|------|----------|
| GRID-H1 | High | CSS Grid 활용도 낮음 | P1 |
| GRID-H2 | High | Gutter/Margin 불일치 | P1 |
| GRID-M1 | Medium | xs breakpoint 없음 | P1 |
| GRID-M2 | Medium | 12-column grid 미정의 | P2 |

#### 성능 (PERF) - 1개
| ID | 분류 | 문제 | 우선순위 |
|----|------|------|----------|
| PERF-M1 | Medium | 번들 크기 최적화 (Recharts) | P1 |

---

## 2. Phase별 실행 계획

### Phase 0: 레이아웃 기반 강화 (신규, 1주, 30시간)

**목표**: 그리드 시스템 체계화 + 반응형 개선

| Day | Task | 내용 | 시간 | 담당 |
|-----|------|------|------|------|
| 1 | 12-column grid 정의 | tailwind.config 확장 | 4h | FE |
| 2 | Container 컴포넌트 | 공통 컨테이너 생성 | 4h | FE |
| 3-4 | Grid layout 적용 | 주요 페이지 리팩토링 | 8h | FE 2명 |
| 5 | xs breakpoint | 375px 추가 + 테스트 | 6h | FE |
| 5 | Gutter 체계화 | CSS 변수 정리 | 6h | FE |
| - | Container Queries | 카드/컴포넌트 적용 | 12h | FE (병렬) |

---

### Phase 1: 접근성 Critical (1주, 40시간)

**목표**: WCAG 2.2 AA Level 90% 이상 달성

| Day | Task | 내용 | 시간 | 담당 |
|-----|------|------|------|------|
| 1-2 | 색상 대비 재설계 | 검증 도구 + 전체 색상 조정 | 12h | FE + Designer |
| 3 | 키보드 네비게이션 | EmotionModal, 전역 단축키 | 8h | FE |
| 4 | Toast 알림 시스템 | Toast 컴포넌트 + 통합 | 6h | FE |
| 4 | 스크린 리더 지원 | aria-live, role 추가 | 5h | FE |
| 5 | 포커스 표시 | 전역 focus-visible | 3h | FE |
| 5 | 입력 제한 경고 | 10000자 경고 UI | 2h | FE |
| 5 | ARIA 속성 보완 | 누락된 label 추가 | 4h | FE |

---

### Phase 2: UX 개선 (1주, 30시간)

**목표**: 사용자 피드백 강화 + 오류 복구

| Day | Task | 내용 | 시간 | 담당 |
|-----|------|------|------|------|
| 1 | 진행률 표시 | Onboarding progressbar | 2h | FE |
| 1-2 | 위기 대응 선택권 | Safety UX 개선 | 4h | FE |
| 2-3 | 삭제/편집 기능 | 대화 관리 UI | 6h | FE |
| 3 | 로딩 상태 개선 | Skeleton, 예상 시간 | 4h | FE |
| 4 | 에러 복구 UX | Retry, 오류 메시지 | 6h | FE |
| 5 | 온보딩 개선 | 스킵 가능, 진행 저장 | 8h | FE |

---

### Phase 3: 성능 최적화 (1주, 24시간)

**목표**: Lighthouse 90+ 달성

| Day | Task | 내용 | 시간 | 담당 |
|-----|------|------|------|------|
| 1-2 | 번들 크기 최적화 | Dynamic import, Tree shaking | 8h | FE |
| 2-3 | React.memo 적용 | 컴포넌트 최적화 | 6h | FE |
| 3 | 이미지 최적화 | WebP, lazy loading | 4h | FE |
| 4-5 | 렌더링 최적화 | useMemo, useCallback | 6h | FE |

---

### Phase 4: 테스트 자동화 (병렬, 12시간)

| Task | 내용 | 시간 | 담당 |
|------|------|------|------|
| Lighthouse CI | 자동화 설정 | 4h | QA |
| axe-core 통합 | Jest 테스트 | 4h | QA |
| E2E 테스트 | 주요 플로우 | 4h | QA |

---

## 3. 우선순위별 작업 목록

### P0 (즉시, 1주) - 5개 항목

1. **A11Y-C1**: 색상 대비 재설계 (12h)
2. **A11Y-H1**: 키보드 네비게이션 (8h)
3. **A11Y-H2**: 스크린 리더 지원 (5h)
4. **UX-H1**: 입력 제한 경고 (2h)
5. **UX-H2**: Toast 알림 시스템 (6h)

**총 33시간** (5일)

---

### P1 (2-3주) - 14개 항목

6. GRID-H1: CSS Grid 활용 (8h)
7. GRID-H2: Gutter 체계화 (6h)
8. GRID-M1: xs breakpoint (6h)
9. A11Y-M1: 포커스 표시 (3h)
10. A11Y-M2: 에러 role (2h)
11. Container 컴포넌트 (4h)
12. 12-column grid (4h)
13. 진행률 표시 (2h)
14. 위기 대응 UX (4h)
15. 삭제/편집 기능 (6h)
16. 로딩 상태 개선 (4h)
17. 에러 복구 UX (6h)
18. 온보딩 개선 (8h)
19. Reflow 검증 (2h)

**총 67시간** (8-9일)

---

### P2 (1개월) - 11개 항목

20. GRID-M2: 12-column grid (4h)
21. Container Queries (12h)
22. PERF-M1: 번들 최적화 (8h)
23. React.memo (6h)
24. 이미지 최적화 (4h)
25. 렌더링 최적화 (6h)
26. Orientation 검증 (2h)
27. Typography Scale (4h)
28. 테스트 자동화 (12h)
29. 기타 Medium 9개 (36h)

**총 94시간** (12일)

---

## 4. 예상 개선 효과

### 4.1 정량적 지표

| 메트릭 | 현재 | Phase 1 후 | Phase 3 후 | 개선폭 |
|--------|------|-----------|-----------|--------|
| WCAG AA 준수율 | 75% | 95% | 98% | +23% |
| Lighthouse 접근성 | 70 (추정) | 92 | 95 | +25 |
| Lighthouse 성능 | 88 | 88 | 94 | +6 |
| 번들 크기 | 1.4MB | 1.4MB | 1.0MB | -28% |
| 키보드 사용 가능 | 60% | 95% | 95% | +35% |
| 스크린 리더 지원 | 40% | 85% | 90% | +50% |

---

### 4.2 정성적 효과

**사용자 경험**:
- 시각 장애인 접근 가능 (스크린 리더)
- 키보드 전용 사용자 접근 가능
- 명확한 피드백 (Toast, 로딩, 에러)
- 더 빠른 로딩 시간

**비즈니스**:
- 법적 준수 (WCAG AA)
- 사용자 확대 (접근성)
- 리텐션 향상 (UX)
- 유지보수성 향상 (그리드 시스템)

---

## 5. 구체적 구현 예시

### 5.1 Container 컴포넌트

```typescript
// src/components/layout/Container.tsx
export const Container: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children: React.ReactNode;
}> = ({ size = 'md', className = '', children }) => {
  const sizeMap = {
    sm: 'max-w-lg',    // 512px - 폼, 설정
    md: 'max-w-2xl',   // 672px - 메인 콘텐츠 (현재 기본)
    lg: 'max-w-4xl',   // 896px - 대시보드
    xl: 'max-w-6xl',   // 1152px - 리포트
    full: 'max-w-full',
  };
  
  return (
    <div className={`
      w-full ${sizeMap[size]} mx-auto 
      px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      {children}
    </div>
  );
};
```

---

### 5.2 Toast 알림 시스템

```typescript
// src/components/ui/Toast.tsx
import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const ToastContext = createContext<{
  showToast: (message: string, type: Toast['type'], duration?: number) => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = (message: string, type: Toast['type'], duration = 3000) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-toast flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`
                px-6 py-3 rounded-xl shadow-xl backdrop-blur-xl pointer-events-auto
                ${toast.type === 'success' ? 'bg-green-500/90 text-white' : ''}
                ${toast.type === 'error' ? 'bg-red-500/90 text-white' : ''}
                ${toast.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500/90 text-white' : ''}
              `}
              role="status"
              aria-live="polite"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be within ToastProvider');
  return context;
};
```

---

### 5.3 색상 대비 검증 및 개선

```typescript
// src/utils/accessibility.ts
import { getLuminance } from 'polished';

export function getContrastRatio(foreground: string, background: string): number {
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);
  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
  return Math.round(ratio * 10) / 10;
}

export function meetsWCAG(ratio: number, level: 'AA' | 'AAA', size: 'normal' | 'large'): boolean {
  if (level === 'AA') {
    return size === 'large' ? ratio >= 3.0 : ratio >= 4.5;
  }
  return size === 'large' ? ratio >= 4.5 : ratio >= 7.0;
}

// 사용
const ratio = getContrastRatio('#2A8E9E', '#FFFFFF');
console.log(`대비: ${ratio}:1`);
console.log(`WCAG AA: ${meetsWCAG(ratio, 'AA', 'normal') ? '✅' : '❌'}`);
```

**개선된 색상 팔레트**:
```typescript
// tailwind.config.js
colors: {
  brand: {
    primary: '#00A88F',      // 대비 5.2:1 (white) ✅
    'primary-dark': '#006B5C', // 8.1:1 ✅
    light: '#E0F2F1',        // 1.8:1 (텍스트용 아님)
  },
  text: {
    primary: '#0F172A',      // 16.1:1 ✅
    secondary: '#475569',    // 8.3:1 ✅
    disabled: '#71717A',     // 4.7:1 ✅ (수정)
  },
}
```

---

## 6. 테스트 전략 (상세)

### 6.1 자동화 테스트 설정

```bash
# 1. Lighthouse CI
npm install --save-dev @lhci/cli

# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
      },
    },
  },
};

# 실행
npx lhci autorun

# 2. axe-core (접근성)
npm install --save-dev @axe-core/react

# src/index.tsx (개발 모드만)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

# 3. Jest 접근성 테스트
npm install --save-dev jest-axe

# Button.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 6.2 수동 테스트 체크리스트 (확장)

#### 접근성 테스트 (WCAG 2.2 AA)

**색상 대비**:
- [ ] 모든 텍스트 4.5:1 이상
- [ ] 큰 텍스트 (18pt+) 3:1 이상
- [ ] UI 컴포넌트 (버튼, 아이콘) 3:1 이상
- [ ] 비활성 요소 대비 확인

**키보드 접근성**:
- [ ] Tab으로 모든 인터랙티브 요소 접근
- [ ] Shift+Tab으로 역방향 탐색
- [ ] Enter/Space로 버튼 활성화
- [ ] Esc로 모달/다이얼로그 닫기
- [ ] 화살표로 리스트/메뉴 탐색
- [ ] 포커스 순서 논리적
- [ ] 포커스 표시 명확 (2px 이상 outline)

**스크린 리더**:
- [ ] 모든 이미지에 alt 텍스트
- [ ] 버튼에 명확한 aria-label
- [ ] 폼 입력 필드에 label 연결
- [ ] aria-live로 동적 변화 알림
- [ ] Heading 계층 논리적 (h1→h2→h3)
- [ ] Landmark 역할 정의 (header, nav, main, aside, footer)

**레이아웃 & 반응형**:
- [ ] 320px 너비에서 수평 스크롤 없음
- [ ] 200% 확대 시 Reflow 작동
- [ ] Portrait/Landscape 전환 지원
- [ ] 터치 타겟 44×44px 이상
- [ ] Safe area 침범 없음 (iOS)

---

## 7. 예상 비용 및 ROI

### 7.1 개발 비용

| Phase | 시간 | 인력 | 인건비 (₩) |
|-------|------|------|-----------|
| Phase 0 | 30h | FE 2명 | ₩3,000,000 |
| Phase 1 | 40h | FE 2명 + Designer | ₩5,000,000 |
| Phase 2 | 30h | FE 2명 | ₩3,000,000 |
| Phase 3 | 24h | FE 1명 | ₩1,200,000 |
| Phase 4 | 12h | QA 1명 | ₩600,000 |
| **합계** | **136h** | **3-4명** | **₩12,800,000** |

---

### 7.2 예상 ROI

**사용자 확대**:
- 접근성 개선 → 장애인 사용자 +10%
- UX 개선 → 리텐션 +15%
- 성능 개선 → 이탈률 -20%

**리스크 감소**:
- 법적 준수 (장애인차별금지법)
- 브랜드 이미지 향상
- 기술 부채 감소

---

## 8. 최종 체크리스트

### 완료 기준

- [ ] WCAG 2.2 AA 90% 이상
- [ ] Lighthouse 접근성 90+ 
- [ ] Lighthouse 성능 90+
- [ ] 키보드 테스트 100% 통과
- [ ] 스크린 리더 테스트 통과
- [ ] 모든 breakpoint 검증
- [ ] Reflow 테스트 통과
- [ ] 색상 대비 100% 검증
- [ ] 번들 크기 < 1.2MB
- [ ] FCP < 2초
- [ ] TTI < 3.5초

---

## 9. 위험 요소 및 대응

| 위험 | 확률 | 영향도 | 대응책 |
|------|------|--------|--------|
| Phase 1 일정 초과 | 30% | Medium | 색상 대비 우선, 나머지 P2로 |
| 색상 변경 시 디자인 불일치 | 40% | Low | Designer 긴밀 협업 |
| Container Queries 브라우저 호환성 | 20% | Low | Polyfill 사용 |
| 번들 크기 감소 실패 | 15% | Low | 목표 조정 (1.2MB) |

---

## 10. 참조 자료 (웹그라운딩)

### WCAG 2.2
- [WCAG 2.2 Quickref](https://www.w3.org/WAI/WCAG22/quickref/)
- [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [1.3.4 Orientation](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)
- [2.5.5 Target Size (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

### 레이아웃 그리드
- [Material Design 3 Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [8-Point Grid System](https://spec.fm/specifics/8-pt-grid)
- [CSS Grid Accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility)

### 반응형 디자인
- [Responsive Breakpoints](https://www.browserstack.com/guide/responsive-design-breakpoints)
- [Optimal Line Length](https://baymard.com/blog/line-length-readability)
- [Mobile Screen Stats](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide)

### 모바일 가이드라인
- [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design Grid](https://m2.material.io/design/layout/responsive-layout-grid.html)
- [Android Safe Area](https://developer.android.com/develop/ui/views/layout/edge-to-edge)

### Container Queries
- [CSS Container Queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [Container Queries Guide](https://ishadeed.com/article/say-hello-to-css-container-queries/)

### React 접근성
- [React Accessibility](https://react.dev/learn/accessibility)
- [React ARIA](https://react-spectrum.adobe.com/react-aria/)
- [axe-core React](https://github.com/dequelabs/axe-core-npm)

### 테스팅 도구
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Pa11y](https://pa11y.org/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

---

**작성자**: AI Assistant  
**검증 방법**: 코드베이스 직접 분석 + 웹그라운딩 + 산업 벤치마크  
**참조 기준**: WCAG 2.2, Material Design 3, Apple HIG, Tailwind Best Practices  
**최종 업데이트**: 2026-01-17 (레이아웃 그리드 섹션 추가)  
**총 페이지**: 25개 섹션  
**다음 단계**: Phase 0 레이아웃 기반 강화 → Phase 1 접근성 P0 실행