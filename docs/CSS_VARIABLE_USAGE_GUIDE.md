# CSS 변수 사용 가이드

**작성일**: 2026-01-13  
**대상**: 전체 프론트엔드 개발자

---

## 1. 개요

이 프로젝트는 완전한 CSS 변수 시스템을 구축하여 디자인 토큰을 중앙에서 관리합니다. 모든 CSS 변수는 Tailwind CSS와 통합되어 있어 클래스로도 사용할 수 있습니다.

---

## 2. CSS 변수 파일 구조

### 2.1 파일 위치

- **CSS 변수 정의**: `src/styles/variables.css`
- **Tailwind 설정**: `tailwind.config.js`
- **TypeScript 유틸리티**: `src/utils/style/`

### 2.2 변수 카테고리

1. **Spacing** (`--spacing-*`)
2. **Viewport 단위** (`--vh-*`, `--vw-*`)
3. **Z-Index** (`--z-*`)
4. **브랜드 색상** (`--color-brand-*`)
5. **감정 색상** (`--color-emotion-*`)
6. **상태 색상** (`--color-status-*`)
7. **Border Radius** (`--radius-*`)
8. **그림자** (`--shadow-*`)
9. **애니메이션** (`--duration-*`, `--ease-*`)
10. **타이포그래피** (`--text-*`, `--font-*`)

---

## 3. 사용 방법

### 3.1 Tailwind 클래스 사용 (권장)

**가장 간단하고 권장되는 방법**:

```tsx
// Z-index
<div className="z-content-base">...</div>
<div className="z-modal">...</div>

// 색상
<div className="bg-brand-primary text-white">...</div>
<div className="text-emotion-joy-400">...</div>

// Spacing
<div className="p-4 px-6 py-8">...</div>

// Border Radius
<div className="rounded-lg rounded-modal">...</div>

// 그림자
<div className="shadow-brand shadow-glass">...</div>
```

### 3.2 직접 CSS 변수 사용

**인라인 스타일이나 동적 값이 필요한 경우**:

```tsx
// 인라인 스타일
<div style={{ 
  boxShadow: 'var(--shadow-xs)',
  borderRadius: 'var(--radius-lg)'
}}>...</div>

// calc()와 함께 사용
<div style={{ 
  height: 'calc(100% - var(--dock-height))'
}}>...</div>
```

### 3.3 TypeScript 유틸리티 사용

**런타임에 CSS 변수를 읽어야 하는 경우**:

```tsx
import { getCSSVariable, setCSSVariable } from '@/utils/style';

// CSS 변수 읽기
const brandColor = getCSSVariable('--color-brand-primary');

// CSS 변수 설정 (동적 테마 변경 등)
setCSSVariable('--color-brand-primary', '#FF0000');
```

---

## 4. 마이그레이션 체크리스트

### 4.1 Z-index 마이그레이션

**Before**:
```tsx
<div className="z-10">...</div>
<div className="z-0">...</div>
```

**After**:
```tsx
<div className="z-content-base">...</div>
<div className="z-base">...</div>
```

**체크리스트**:
- [ ] `z-0` → `z-base`
- [ ] `z-10` → `z-content-base`
- [ ] `z-50` → `z-nav` 또는 `z-header` 또는 `z-dock`
- [ ] 하드코딩된 `z-[100]` → 적절한 CSS 변수 클래스

### 4.2 색상 마이그레이션

**Before**:
```tsx
<div style={{ backgroundColor: '#2A8E9E' }}>...</div>
<div className="text-[#2A8E9E]">...</div>
```

**After**:
```tsx
<div className="bg-brand-primary">...</div>
<div className="text-brand-primary">...</div>
```

**체크리스트**:
- [ ] `#2A8E9E` → `bg-brand-primary` 또는 `text-brand-primary`
- [ ] `rgba(42, 142, 158, 0.5)` → `bg-brand-primary/50`
- [ ] 하드코딩된 색상 → CSS 변수 클래스

### 4.3 Spacing 마이그레이션

**Before**:
```tsx
<div style={{ padding: '16px' }}>...</div>
<div className="p-[16px]">...</div>
```

**After**:
```tsx
<div className="p-4">...</div>  // 16px = 1rem = spacing-4
```

**체크리스트**:
- [ ] 하드코딩된 `px` 값 → Tailwind spacing 클래스
- [ ] 인라인 스타일 spacing → Tailwind 클래스

### 4.4 Border Radius 마이그레이션

**Before**:
```tsx
<div style={{ borderRadius: '16px' }}>...</div>
<div className="rounded-[16px]">...</div>
```

**After**:
```tsx
<div className="rounded-md">...</div>  // 16px = 1rem = radius-md
<div className="rounded-modal">...</div>  // 모달용
```

**체크리스트**:
- [ ] 하드코딩된 `borderRadius` → Tailwind 클래스
- [ ] 모달/카드/버튼 → 시맨틱 클래스 (`rounded-modal`, `rounded-card`, `rounded-button`)

---

## 5. 컴포넌트별 사용 예시

### 5.1 모달 컴포넌트

```tsx
export const Modal = () => {
  return (
    <>
      {/* 배경 */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-modal-backdrop" />
      
      {/* 모달 */}
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        <div className="bg-white rounded-modal shadow-xl p-8 max-w-md w-full">
          {/* 내용 */}
        </div>
      </div>
    </>
  );
};
```

### 5.2 카드 컴포넌트

```tsx
export const Card = () => {
  return (
    <div className="bg-white rounded-card shadow-brand p-6">
      {/* 내용 */}
    </div>
  );
};
```

### 5.3 버튼 컴포넌트

```tsx
export const Button = () => {
  return (
    <button className="
      bg-brand-primary text-white
      px-8 py-4 rounded-button
      shadow-brand hover:shadow-brand-md
      transition-all duration-normal
    ">
      클릭
    </button>
  );
};
```

---

## 6. 주의사항

### 6.1 동적 값 처리

**동적 값이 필요한 경우**:
```tsx
// ✅ 좋은 예: CSS 변수 사용
<div style={{ 
  height: `calc(100% - var(--dock-height))`,
  backgroundColor: `var(--color-emotion-${emotion}-400)`
}}>...</div>

// ❌ 나쁜 예: 하드코딩
<div style={{ 
  height: 'calc(100% - 80px)',
  backgroundColor: '#2A8E9E'
}}>...</div>
```

### 6.2 라이브러리 제약

**Recharts 등 일부 라이브러리는 CSS 변수를 직접 지원하지 않음**:
```tsx
// 런타임에 CSS 변수 읽기
import { getCSSVariable } from '@/utils/style';

const brandColor = getCSSVariable('--color-brand-primary');

<Tooltip
  contentStyle={{
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${brandColor}`,
    borderRadius: getCSSVariable('--radius-lg'),
  }}
/>
```

### 6.3 다크 모드

**다크 모드 색상은 자동으로 적용됨**:
```tsx
// CSS 변수가 자동으로 다크 모드 색상으로 변경됨
<div className="bg-brand-primary text-white">
  {/* 다크 모드에서 자동으로 어두운 색상 적용 */}
</div>
```

---

## 7. 참고 자료

- [CSS 변수 정의 파일](src/styles/variables.css)
- [Tailwind 설정](tailwind.config.js)
- [CSS 변수 유틸리티](src/utils/style/cssVariables.ts)
- [Z-index 관리](src/utils/style/zIndexManager.ts)
- [CSS 변수 사용률 보고서](docs/CSS_VARIABLE_USAGE_REPORT.md)

---

## 8. 질문 및 지원

CSS 변수 사용에 대한 질문이나 문제가 있으면 다음을 확인하세요:

1. `src/styles/variables.css`에서 변수 정의 확인
2. `tailwind.config.js`에서 Tailwind 클래스 매핑 확인
3. `src/utils/style/`에서 유틸리티 함수 확인
