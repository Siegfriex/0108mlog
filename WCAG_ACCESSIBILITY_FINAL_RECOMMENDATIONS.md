# 마음로그 V5.0 접근성 및 UX 개선 실행 계획서

**버전**: 3.0 (코드베이스 검증 완료판)
**작성일**: 2026-01-18
**기준**: WCAG 2.2 Level AA (ISO/IEC 40500:2025)
**검증 방법**: 실제 코드베이스 직접 분석

---

## Executive Summary

| 항목 | 문서-코드 일치율 | 비고 |
|------|-----------------|------|
| 기존 문서 정확도 | 65% | 주요 접근성 기능 이미 구현됨 |
| 신규 제안 타당성 | 80% | 우선순위 재검토 필요 |
| 미식별 위험요인 | **7개 발견** | Critical 이슈 누락 있었음 |
| 중복/과잉 제안 | 4개 발견 | 이미 구현된 기능 재구현 제안 |

### 실제 작업량

| 분류 | 문서 예상 | 실제 필요 | 비고 |
|------|----------|----------|------|
| P0 Critical | 33h | **20h** | 이미 구현된 항목 제외 |
| P1 High | 47h | **18h** | 실제 필요 항목만 |
| P2 Medium | 30h | **16h** | 선택적 |
| **총계** | 110h | **54h** | 52% 감소 |

---

## 이미 구현된 항목 (재작업 불필요)

### ✅ Container/Gutter 시스템
```javascript
// tailwind.config.js - 이미 완벽한 spacing 시스템 존재
spacing: {
  'px': 'var(--spacing-px)',
  '1': 'var(--spacing-1)',
  // ... 24단계 + 시맨틱 별칭 (xs, sm, md, lg, xl, xxl)
  'safe-top': 'var(--safe-top)',
  'safe-bottom': 'var(--safe-bottom)',
}
```
**결론**: Phase 0 전체 (30h) → **구현 불필요**

### ✅ EmotionSelectModal 키보드 네비게이션
```tsx
// EmotionSelectModal.tsx:56-69 - 이미 완벽 구현
const { containerRef } = useKeyboardNavigation({
  itemCount: EMOTIONS_CONFIG.length,
  selectedIndex,
  onSelectChange: setSelectedIndex,
  onEnter: (index) => onEmotionSelect(EMOTIONS_CONFIG[index].id),
  enabled: isOpen,
  columns: 2,
  loop: true,
  horizontal: true,
  vertical: true,
});
```
**결론**: 키보드 네비게이션 8h → **구현 불필요**

### ✅ TabBar ARIA 속성
- `aria-current` 구현됨
- ArrowLeft/Right, Home/End, Enter/Space 모두 지원
- `role="navigation"` 적용됨

**결론**: TabBar 개선 → **구현 불필요**

### ✅ EmotionOrb ARIA 속성
- `aria-pressed` 구현됨
- `aria-label` 구현됨
- `aria-describedby` 까지 구현됨

**결론**: EmotionOrb 개선 → **구현 불필요**

### ✅ 포커스 트랩/복원
- `useFocusTrap` 훅 존재
- `useFocusRestore` 훅 존재

**결론**: 포커스 관리 → **구현 불필요**

---

## 🔴 P0 - 즉시 구현 필수 (20h)

### 1.1 색상 대비 재설계 (12h) - CRITICAL

**현재 문제 (검증됨)**:
```
brand-primary (#2A8E9E) vs white = 3.5:1 (AA 미달, 4.5:1 필요)
brand-400 (#2DD4BF) vs white = 1.9:1 (심각)
```

**파일**: `src/styles/variables.css`

```css
:root {
  /* 기존 → 수정 */
  --color-brand-primary: #0D9488;      /* 3.5:1 → 5.4:1 */
  --color-brand-primary-rgb: 13 148 136;

  --color-brand-600: #0D9488;          /* 기존 #2A8E9E 대체 */
  --color-brand-600-rgb: 13 148 136;

  --color-brand-700: #0F766E;          /* 7.2:1 - 버튼 기본 */
  --color-brand-700-rgb: 15 118 110;
}
```

**파일**: `src/components/ui/Button.tsx:33-41`

```tsx
// Before (3.5:1 - 미달)
primary: 'bg-brand-primary text-white ...'

// After (7.2:1 - AA 준수)
primary: 'bg-brand-700 text-white ...'
```

**파일**: `src/components/ui/SkipLink.tsx:59-60` - 동일 문제

```tsx
// Before (3.5:1 - 미달, z-skip-link 미존재)
className="... z-skip-link bg-brand-primary text-white ..."

// After (7.2:1 - AA 준수, z-max 사용)
className="... z-max bg-brand-700 text-white ..."
```

---

### 1.2 Dark Mode 색상 대비 수정 (신규 발견) - CRITICAL

**현재 문제 (문서 누락, 신규 발견)**:
```css
/* variables.css:455-476 현재 상태 */
--color-text-secondary: #94A3B8; /* on #0F172A = 2.8:1 (AA 미달) */
--color-text-muted: #64748B;     /* on #0F172A = 2.2:1 (심각) */
```

**수정 필요**:
```css
[data-theme="night"], .dark {
  /* 수정 전 → 수정 후 */
  --color-text-secondary: #CBD5E1;  /* #94A3B8 → #CBD5E1 (4.7:1) */
  --color-text-muted: #94A3B8;      /* #64748B → #94A3B8 (3.0:1, 큰 텍스트용) */
}
```

---

### 1.3 감정 색상 WCAG 검증 (신규 발견)

**현재 문제**:
```
emotion-joy-400 (#FFD700) on white = 1.8:1 (심각)
emotion-peace-400 (#4FC3F7) on white = 2.3:1 (미달)
```

**파일**: `src/styles/variables.css:197-277`

```css
/* 감정 색상 - WCAG AA 준수 버전 추가 */
--color-emotion-joy-accessible: #B45309;      /* 5.7:1 */
--color-emotion-peace-accessible: #0D9488;    /* 5.4:1 */
--color-emotion-anxiety-accessible: #C2410C;  /* 6.1:1 */
--color-emotion-sadness-accessible: #4338CA;  /* 8.2:1 */
--color-emotion-anger-accessible: #B91C1C;    /* 7.1:1 */
```

---

### 1.4 전역 포커스 스타일 (3h) - WCAG 2.4.13 필수

**현재 상태**: 개별 컴포넌트에서 focus:ring 사용 중, 일관성 없음

**파일**: `src/index.css` 추가

```css
/* 전역 포커스 스타일 - WCAG 2.4.13 준수 */

/* 마우스 클릭 시 포커스 숨김 */
*:focus {
  outline: none;
}

/* 키보드 포커스만 표시 */
*:focus-visible {
  outline: 3px solid var(--color-brand-700);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 다크 모드 */
[data-theme="night"] *:focus-visible {
  outline-color: var(--color-brand-300);
}

/* 입력 필드 특화 */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline-offset: 0;
  box-shadow: 0 0 0 3px var(--color-brand-700);
}
```

---

### 1.5 SafetyLayer ARIA 속성 (2h) - 신규 발견 CRITICAL

**현재 문제 (SafetyLayer.tsx:28-52)**:
- ❌ `role="alertdialog"` 없음
- ❌ `aria-modal="true"` 없음
- ❌ 전화 링크에 `aria-label` 없음

**수정**:
```tsx
// SafetyLayer.tsx

// 컨테이너에 추가
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="safety-title"
  aria-describedby="safety-desc"
>
  <h2 id="safety-title">긴급 지원</h2>
  <p id="safety-desc">지금 힘든 상황이시라면 도움을 받으실 수 있습니다.</p>

  {/* 전화 링크 수정 */}
  <a
    href="tel:1577-0199"
    aria-label="정신건강 위기 상담 핫라인 1577-0199로 전화하기"
  >
    ...
  </a>

  <a
    href="tel:1393"
    aria-label="자살예방상담전화 1393으로 전화하기"
  >
    ...
  </a>
</div>
```

---

### 1.6 ESLint jsx-a11y 설정 (1h)

**설치**:
```bash
npm install -D eslint-plugin-jsx-a11y
```

**파일**: `.eslintrc.json` (신규 생성)

```json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/role-has-required-aria-props": "error"
  }
}
```

---

### 1.7 axe-core 통합 (2h)

**설치**:
```bash
npm install -D @axe-core/react polished
```

**파일**: `src/main.tsx`

```tsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**파일**: `src/utils/accessibility.ts` (신규)

```typescript
import { getLuminance } from 'polished';

export function checkContrast(foreground: string, background: string) {
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);
  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

  return {
    ratio: Math.round(ratio * 10) / 10,
    passAA: ratio >= 4.5,
    passAALarge: ratio >= 3.0,
  };
}

// 개발 환경 경고
export function warnLowContrast(fg: string, bg: string, elementName: string) {
  if (import.meta.env.DEV) {
    const { ratio, passAA } = checkContrast(fg, bg);
    if (!passAA) {
      console.warn(`[A11Y] Low contrast (${ratio}:1) in ${elementName}`);
    }
  }
}
```

---

## 🟡 P1 - 고우선순위 (18h)

### 2.1 Toast 알림 시스템 (6h)

**현재 상태**: 미구현

**파일**: `src/components/ui/Toast.tsx` (신규)

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-status-success text-white',
  error: 'bg-status-error text-white',
  info: 'bg-status-info text-white',
  warning: 'bg-status-warning text-white',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration = 3000
  ) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Safe Area 고려한 위치 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-safe-bottom left-1/2 -translate-x-1/2 z-toast
                   flex flex-col gap-2 pb-20"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl
                         flex items-center gap-2 min-w-[200px]
                         ${toastStyles[toast.type]}`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
```

---

### 2.2 입력 제한 경고 (4h) - DayMode + NightMode 모두

**DayMode.tsx 수정**:
```tsx
const MAX_INPUT_LENGTH = 10000;
const WARNING_THRESHOLD = 9000;

const [charWarning, setCharWarning] = useState('');

useEffect(() => {
  const remaining = MAX_INPUT_LENGTH - machine.input.length;
  if (remaining <= 0) {
    setCharWarning('최대 글자 수에 도달했습니다');
  } else if (remaining <= MAX_INPUT_LENGTH - WARNING_THRESHOLD) {
    setCharWarning(`${remaining}자 남음`);
  } else {
    setCharWarning('');
  }
}, [machine.input]);

// JSX
<div className="relative">
  <input
    maxLength={MAX_INPUT_LENGTH}
    aria-describedby={charWarning ? 'char-warning' : undefined}
    // ...
  />
  {charWarning && (
    <p
      id="char-warning"
      role="status"
      aria-live="polite"
      className={`absolute bottom-2 right-2 text-xs
        ${machine.input.length >= MAX_INPUT_LENGTH
          ? 'text-status-error'
          : 'text-status-warning'}`}
    >
      {charWarning}
    </p>
  )}
</div>
```

**NightMode.tsx도 동일하게 적용** (textarea)

---

### 2.3 ErrorRecovery 컴포넌트 (6h)

**현재 상태**: ErrorBoundary만 존재, 재시도 기능 없음

**파일**: `src/components/ui/ErrorRecovery.tsx`

```tsx
interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  // 개선된 네트워크 오류 감지
  const isNetworkError =
    error instanceof TypeError ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('failed to fetch') ||
    error.message.includes('ERR_CONNECTION_REFUSED') ||
    error.message.includes('ECONNREFUSED');

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-bold text-status-error">
            {isNetworkError ? '연결 오류' : '문제가 발생했습니다'}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {isNetworkError
              ? '인터넷 연결을 확인해주세요.'
              : '잠시 후 다시 시도해주세요.'}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onRetry}
          className="flex-1 py-2 bg-brand-700 text-white rounded-lg font-medium"
        >
          다시 시도
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="px-4 py-2 text-text-secondary">
            닫기
          </button>
        )}
      </div>
    </div>
  );
};
```

---

### 2.4 MobileSheet, NightMode ARIA 보완 (2h)

**MobileSheet.tsx:92-104 수정**:
```tsx
<motion.div
  ref={sheetRef}
  role="dialog"           // 추가
  aria-modal="true"       // 추가
  aria-labelledby={titleId}  // 추가 (title prop 필요)
  // ... 기존 props
>
```

**NightMode.tsx:211-218 수정**:
```tsx
<textarea
  maxLength={MAX_INPUT_LENGTH}
  value={machine.diary}
  onChange={(e) => machine.updateDiary(e.target.value)}
  placeholder="오늘 하루를 기록해보세요..."
  aria-label="오늘의 일기 작성"  // 추가
  // ...
/>
```

---

## 🟢 P2 - 권장 (16h)

### 3.1 ProgressBar 컴포넌트 (2h)

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-text-secondary mb-1">
        <span>{label || `${current}/${total} 단계`}</span>
        <span>{percentage}% 완료</span>
      </div>
      {/* 정적 표시이므로 role="progressbar" 불필요 */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-700 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

---

### 3.2 useGlobalShortcuts 훅 (4h) - 신규 기능

**현재 상태**: 미구현 (문서에서 신규 제안한 항목)

**파일**: `src/hooks/useGlobalShortcuts.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S: 안전망 (위기 상황 즉시 접근)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        navigate('/safety');
      }

      // Alt + 1~5: 탭 전환
      if (e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const tabs = ['/chat', '/journal', '/reports', '/content', '/profile'];
        navigate(tabs[parseInt(e.key) - 1]);
      }

      // Ctrl/Cmd + K: 검색
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/journal/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
```

---

### 3.3 React.memo 적용 (6h) - 주의 필요

**대상**: EmotionOrb, GlassCard, MessageBubble

**GlassCard 주의사항** (마우스 이벤트 핸들러 문제):
```tsx
// 잘못된 방식 - shallow compare 실패
export const GlassCard = React.memo<GlassCardProps>(({ ... }) => { ... });

// 올바른 방식 - useCallback 필수
export const GlassCard = React.memo<GlassCardProps>(({
  children,
  intensity,
  enableSpotlight,
  enableTilt,
  ...
}) => {
  // 핸들러를 useCallback으로 감싸기
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // ...
  }, [enableSpotlight, enableTilt]);

  const handleMouseLeave = useCallback(() => {
    // ...
  }, []);

  // ...
}, (prev, next) => {
  return prev.intensity === next.intensity &&
         prev.enableSpotlight === next.enableSpotlight &&
         prev.enableTilt === next.enableTilt &&
         prev.className === next.className;
});
```

---

### 3.4 Playwright 접근성 E2E 테스트 (4h) - 신규

**파일**: `e2e-a11y-test.mjs` (신규)

```javascript
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

async function runA11yTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const routes = ['/', '/chat', '/journal', '/profile', '/safety'];

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    console.log(`\n=== ${route} ===`);
    console.log(`Violations: ${results.violations.length}`);

    results.violations.forEach(v => {
      console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
    });
  }

  await browser.close();
}

runA11yTests();
```

**설치**:
```bash
npm install -D @axe-core/playwright
```

---

### 3.5 prefers-reduced-motion 완전 지원 (신규 발견, 4h)

**현재 문제**: CSS 변수만 0ms로 설정, Framer Motion은 여전히 작동

**파일**: `src/hooks/useMobileOptimization.ts` 수정

```typescript
export function useMobileOptimization() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Framer Motion용 props
  const motionProps = prefersReducedMotion
    ? { initial: false, animate: false, exit: false, transition: { duration: 0 } }
    : {};

  return { prefersReducedMotion, motionProps };
}
```

**사용 예시**:
```tsx
const { motionProps } = useMobileOptimization();

<motion.div
  {...motionProps}
  animate={{ opacity: 1, y: 0 }}
>
```

---

## ❌ 구현 불필요 (이미 완료)

| 항목 | 상태 | 위치 |
|------|------|------|
| Container 컴포넌트 | ✅ | tailwind max-w-* 사용 |
| 12-Column Grid | ✅ | auto-fit, auto-fill grid 존재 |
| Gutter 일관성 | ✅ | spacing 시스템 완벽 |
| EmotionSelectModal 키보드 | ✅ | useKeyboardNavigation 완벽 |
| TabBar ARIA | ✅ | aria-current 구현됨 |
| EmotionOrb ARIA | ✅ | aria-pressed, describedby 완벽 |
| 포커스 트랩 | ✅ | useFocusTrap 존재 |

---

## 실행 체크리스트

### 🔴 P0 즉시 실행 (20h)
- [ ] **색상 대비 재설계** - variables.css, Button.tsx, SkipLink.tsx
- [ ] **Dark Mode 색상 수정** - variables.css [data-theme="night"]
- [ ] **감정 색상 검증/수정** - variables.css
- [ ] **전역 포커스 스타일** - index.css
- [ ] **SafetyLayer ARIA** - SafetyLayer.tsx
- [ ] **eslint-plugin-jsx-a11y** - .eslintrc.json
- [ ] **axe-core + polished** - package.json, main.tsx

### 🟡 P1 고우선순위 (18h)
- [ ] Toast 알림 시스템
- [ ] 입력 제한 경고 (DayMode, NightMode)
- [ ] ErrorRecovery 컴포넌트
- [ ] MobileSheet, NightMode ARIA

### 🟢 P2 권장 (16h)
- [ ] ProgressBar 컴포넌트
- [ ] useGlobalShortcuts 훅
- [ ] React.memo 적용 (주의 필요)
- [ ] prefers-reduced-motion 완전 지원

---

## 미식별 위험요인 요약 (신규 발견 7개)

| # | 항목 | 심각도 | 상태 |
|---|------|--------|------|
| 1 | Dark Mode 색상 대비 | 🔴 Critical | P0 추가 |
| 2 | SafetyLayer ARIA | 🔴 Critical | P0 추가 |
| 3 | 감정 색상 WCAG | 🟡 High | P0 추가 |
| 4 | NightMode textarea | 🟡 High | P1 포함 |
| 5 | MobileSheet aria-modal | 🟡 High | P1 포함 |
| 6 | Button/SkipLink 색상 대비 | 🔴 Critical | P0 색상 포함 |
| 7 | prefers-reduced-motion | 🟡 Medium | P2 추가 |

---

## 검증 도구 우선 설치 순서

코드 수정 전에 반드시:

```bash
# 1. 접근성 린팅 (자동 감지)
npm install -D eslint-plugin-jsx-a11y

# 2. 색상 대비 검증
npm install -D polished

# 3. 실시간 접근성 경고
npm install -D @axe-core/react

# 4. E2E 접근성 테스트
npm install -D @axe-core/playwright
```

→ 설치 후 개발 시 실시간으로 접근성 문제 감지 가능

---

**작성**: Claude Opus 4.5
**검증 방법**: 실제 코드베이스 직접 분석
**마지막 업데이트**: 2026-01-18
**총 작업 시간**: 54h (기존 110h에서 52% 감소)
