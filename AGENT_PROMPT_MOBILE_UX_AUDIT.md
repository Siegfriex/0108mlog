# 🎯 모바일 UX/UI 전체 감사 에이전트 프롬프트

**목표**: 배포된 사이트의 모든 탭을 모바일 뷰포트로 E2E 테스트 후, 화면별 디자인 개선안 도출  
**산출물**: 탭별 스크린샷 + 상세 디자인 개선 보고서  
**기준**: WCAG 2.1 AA + 모던 모바일 UX 패턴 + 브랜드 일관성

---

## 📋 Phase 1: E2E 테스트 및 스크린샷 캡처

### 설정
```javascript
브라우저 뷰포트: 390 x 844 (iPhone 14 Pro 기준)
배포 URL: https://iness-mlog.web.app
스크린샷 저장 경로: mobile-audit/{탭명}/{화면번호}.png
```

### 테스트 시나리오

#### 1. 온보딩 플로우 (6개 화면)
```yaml
경로: /onboarding
캡처 대상:
  - 01-welcome.png: 웰컴 스크린 (첫 화면)
  - 02-name-input.png: 이름 입력 화면
  - 03-initial-assessment.png: 초기 평가 (감정 선택)
  - 04-permission-request.png: 권한 요청
  - 05-personalization.png: 개인화 설정
  - 06-tutorial-guide.png: 튜토리얼 완료

각 화면별 체크 항목:
  ✓ GNB 진행률 표시 정렬 확인
  ✓ 버튼 터치 타겟 크기 (최소 44x44px)
  ✓ 텍스트 가독성 (폰트 크기, 줄 간격)
  ✓ 여백 일관성 (padding, margin)
  ✓ 버튼/카드 그림자 깊이
  ✓ 애니메이션 부드러움
  ✓ Safe area 처리 (상단 notch, 하단 홈바)
```

#### 2. 채팅 탭 (4개 화면)
```yaml
경로: /chat
캡처 대상:
  - 01-emotion-modal.png: 감정 선택 모달
  - 02-chat-initial.png: 채팅 시작 (인사 메시지)
  - 03-chat-user-message.png: 사용자 메시지 입력 후
  - 04-chat-ai-response.png: AI 응답 표시
  - 05-quick-chips.png: Quick Chips 표시
  - 06-action-card.png: 마이크로 액션 카드 (가능 시)

각 화면별 체크 항목:
  ✓ 헤더 감정 정보 가독성
  ✓ 메시지 버블 크기/간격
  ✓ 입력창 높이 및 전송 버튼 크기
  ✓ Quick Chips 크기 및 간격
  ✓ 스크롤 영역 확보
  ✓ 로딩 인디케이터 크기
  ✓ 닫기 버튼 접근성
```

#### 3. 기록 탭 (3개 화면)
```yaml
경로: /journal
캡처 대상:
  - 01-journal-main.png: 기록 메인 (검색 + 필터 + 캘린더)
  - 02-journal-timeline.png: 타임라인 뷰 (/journal/timeline)
  - 03-journal-journey.png: 저니 뷰 (/journal/journey)

각 화면별 체크 항목:
  ✓ 검색창 크기 및 위치
  ✓ 필터 버튼 크기 (전체/기쁨/평온/불안/슬픔/분노)
  ✓ 캘린더 날짜 터치 타겟
  ✓ 감정 아이콘 크기
  ✓ Check-in CTA 버튼 크기
  ✓ Resilience Score 차트 가독성
```

#### 4. 통계 탭 (2개 화면)
```yaml
경로: /reports
캡처 대상:
  - 01-reports-main.png: 통계 메인
  - 02-monthly-report.png: 월간 리포트 (/reports/monthly)

각 화면별 체크 항목:
  ✓ 차트 크기 및 레이블 가독성
  ✓ 통계 카드 간격
  ✓ 수치 타이포그래피
  ✓ 색상 구분 명확성
  ✓ 범례 위치 및 크기
```

#### 5. 콘텐츠 탭 (4개 화면)
```yaml
경로: /content
캡처 대상:
  - 01-content-main.png: 콘텐츠 메인 (카테고리)
  - 02-content-poems.png: 시/문학 (/content/poems)
  - 03-content-meditations.png: 명상 (/content/meditations)
  - 04-content-music.png: 힐링 음악 (/content/music)

각 화면별 체크 항목:
  ✓ 카테고리 카드 크기
  ✓ 필터 버튼 크기 (분위기 선택)
  ✓ 콘텐츠 그리드 간격 (1열 vs 2열)
  ✓ YouTubeCard 썸네일 비율
  ✓ 로딩 스피너 크기
```

#### 6. 프로필 탭 (3개 화면)
```yaml
경로: /profile
캡처 대상:
  - 01-profile-main.png: 프로필 메인
  - 02-settings.png: 설정 (/profile/settings)
  - 03-privacy.png: 개인정보 처리방침 (/profile/privacy)

각 화면별 체크 항목:
  ✓ 프로필 헤더 크기
  ✓ 설정 목록 간격
  ✓ Toggle 스위치 크기
  ✓ 섹션 구분선 명확성
  ✓ 버튼 계층 구조
```

---

## 📊 Phase 2: 디자인 분석 프레임워크

### 각 화면별 분석 체크리스트

#### A. 레이아웃 (Layout)
```yaml
항목:
  - 헤더 높이 및 safe-area 처리
  - 컨텐츠 영역 padding (좌우/상하)
  - 푸터/TabBar 영역 확보
  - 스크롤 가능 영역 명확성
  - 그리드/플렉스 정렬 정확성

평가 기준:
  - 적절함 (Good): 표준 모바일 패턴 준수
  - 개선 필요 (Needs Improvement): 간격/정렬 미세 조정 필요
  - 문제 있음 (Issue): 터치 타겟 부족, 잘림 현상 등
```

#### B. 타이포그래피 (Typography)
```yaml
항목:
  - 제목 크기 (H1, H2, H3)
  - 본문 텍스트 크기 (Body)
  - 캡션/라벨 크기 (Caption)
  - 줄 간격 (line-height)
  - 글자 간격 (letter-spacing)
  - 색상 대비 (명암비 4.5:1 이상)

평가 기준:
  - Good: 16px 이상, 명암비 충분
  - Needs Improvement: 14px 이하, 명암비 부족
  - Issue: 12px 이하, 읽기 어려움
```

#### C. 인터랙티브 요소 (Interactive Elements)
```yaml
항목:
  - 버튼 크기 (최소 44x44px)
  - 버튼 간격 (최소 8px)
  - Hover/Active 상태 명확성
  - 로딩 상태 표시
  - 에러 상태 표시
  - Disabled 상태 구분

평가 기준:
  - Good: WCAG 2.1 AA 준수
  - Needs Improvement: 터치 타겟 작음 (40px 미만)
  - Issue: 상태 구분 불명확
```

#### D. 색상 시스템 (Color System)
```yaml
항목:
  - 브랜드 컬러 일관성
  - 감정별 컬러 구분
  - 배경/전경 명암 대비
  - 그라데이션 적절성
  - Glassmorphism 투명도

평가 기준:
  - Good: 브랜드 가이드 일치
  - Needs Improvement: 명암비 부족
  - Issue: 컬러 충돌, 가독성 저하
```

#### E. 애니메이션/인터랙션 (Animation)
```yaml
항목:
  - 페이지 전환 애니메이션
  - 버튼 피드백 (scale, opacity)
  - 로딩 애니메이션
  - 모달 표시/숨김 애니메이션
  - 리스트 아이템 애니메이션

평가 기준:
  - Good: 자연스럽고 성능 최적화됨
  - Needs Improvement: 약간 느리거나 과함
  - Issue: 버벅임, 사용자 피로
```

#### F. 피드백 & 상태 (Feedback & State)
```yaml
항목:
  - 에러 메시지 위치
  - 성공 토스트 위치
  - 로딩 인디케이터 명확성
  - 빈 상태 (Empty State) UI
  - 오프라인 상태 표시

평가 기준:
  - Good: 명확하고 시각적으로 구분됨
  - Needs Improvement: 위치 개선 필요
  - Issue: 표시 안 됨 또는 불명확
```

---

## 📝 Phase 3: 개선안 도출 템플릿

### 각 화면별 개선안 작성 형식

```markdown
## [탭명] - [화면명]

### 📸 현재 상태
- 스크린샷: `mobile-audit/{탭명}/{화면번호}.png`
- URL: /경로
- 뷰포트: 390x844

### 🔍 발견된 이슈

#### Critical (P0) - 즉시 수정 필요
| 항목 | 문제 | 영향 | 개선안 |
|------|------|------|--------|
| [요소명] | [구체적 문제] | [사용자 영향] | [코드 수정 방향] |

#### High (P1) - 우선 수정 권장
| 항목 | 문제 | 영향 | 개선안 |
|------|------|------|--------|
| [요소명] | [구체적 문제] | [사용자 영향] | [코드 수정 방향] |

#### Medium (P2) - 개선 권장
| 항목 | 문제 | 영향 | 개선안 |
|------|------|------|--------|
| [요소명] | [구체적 문제] | [사용자 영향] | [코드 수정 방향] |

### ✨ 디자인 개선안

#### Before (현재)
```tsx
// 현재 코드 (문제가 있는 부분)
```

#### After (개선안)
```tsx
// 개선된 코드 (구체적인 수정안)
```

#### 개선 효과
- ✅ [효과 1]
- ✅ [효과 2]
- ✅ [효과 3]

### 📊 개선 점수

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| 레이아웃 | X/10 | Y/10 | +Z% |
| 타이포그래피 | X/10 | Y/10 | +Z% |
| 인터랙티브 요소 | X/10 | Y/10 | +Z% |
| 색상 시스템 | X/10 | Y/10 | +Z% |
| 애니메이션 | X/10 | Y/10 | +Z% |
| 피드백 & 상태 | X/10 | Y/10 | +Z% |
| **전체 평균** | **X/10** | **Y/10** | **+Z%** |
```

---

## 🤖 에이전트 실행 프롬프트

### 프롬프트 텍스트

```
당신은 모바일 UX/UI 전문 디자인 감사 에이전트입니다.

### 작업 목표
배포된 사이트(https://iness-mlog.web.app)의 모든 탭을 모바일 뷰포트(390x844)로 E2E 테스트하고, 
각 화면별로 스크린샷을 캡처한 후, 디테일한 디자인 개선안을 도출합니다.

### 작업 순서

#### Step 1: 환경 설정
1. 브라우저 리사이즈: 390 x 844
2. 배포 사이트 접속: https://iness-mlog.web.app
3. 스크린샷 저장 폴더 생성: mobile-audit/

#### Step 2: 온보딩 플로우 테스트 (6개 화면)
1. /onboarding 접속
2. 각 단계별 스크린샷 캡처:
   - mobile-audit/onboarding/01-welcome.png
   - mobile-audit/onboarding/02-name-input.png
   - mobile-audit/onboarding/03-initial-assessment.png
   - mobile-audit/onboarding/04-permission-request.png
   - mobile-audit/onboarding/05-personalization.png
   - mobile-audit/onboarding/06-tutorial.png
3. 각 화면별 체크리스트 검증:
   - GNB 진행률 정렬 (중앙 정렬 확인)
   - 버튼 크기 (최소 44x44px)
   - 텍스트 크기 (최소 16px)
   - 여백 일관성 (px-5 sm:px-6)
   - 그림자 깊이 (shadow-sm ~ shadow-xl)
   - 애니메이션 부드러움 (duration-300 ~ duration-500)
   - Safe area (pt-safe-top, pb-safe-bottom)

#### Step 3: 채팅 탭 테스트 (6개 화면)
1. /chat 접속
2. 감정 선택 모달 캡처
3. 감정 선택 → 채팅 진입
4. 메시지 입력 → 전송
5. AI 응답 대기 → 캡처
6. Quick Chips 캡처
7. 각 화면별 체크:
   - 헤더 높이 (px-6 py-5)
   - 메시지 버블 max-width (max-w-chat-bubble)
   - 입력창 높이 (py-4)
   - Quick Chips 크기 (px-4 py-2.5)
   - 로딩 spinner 크기 (w-3 h-3)

#### Step 4: 기록 탭 테스트 (3개 화면)
1. /journal 접속 → 메인 화면 캡처
2. /journal/timeline 접속 → 타임라인 캡처
3. /journal/journey 접속 → 저니 캡처
4. 각 화면별 체크:
   - 검색창 크기
   - 필터 버튼 간격 (gap-2)
   - 캘린더 날짜 크기
   - 감정 아이콘 크기
   - 차트 레이블 가독성

#### Step 5: 통계 탭 테스트 (2개 화면)
1. /reports 접속 → 메인 캡처
2. /reports/monthly 접속 → 월간 리포트 캡처
3. 각 화면별 체크:
   - Recharts 차트 크기
   - 통계 카드 padding
   - 수치 폰트 크기
   - 색상 팔레트 일관성

#### Step 6: 콘텐츠 탭 테스트 (4개 화면)
1. /content 접속 → 메인 캡처
2. /content/poems 접속 → 시/문학 캡처
3. /content/meditations 접속 → 명상 캡처
4. /content/music 접속 → 힐링 음악 캡처
5. 각 화면별 체크:
   - 카테고리 그리드 (grid-cols-1 sm:grid-cols-2)
   - 필터 버튼 크기
   - YouTubeCard 썸네일 aspect-ratio
   - 로딩/에러 상태 UI

#### Step 7: 프로필 탭 테스트 (3개 화면)
1. /profile 접속 → 메인 캡처
2. /profile/settings 접속 → 설정 캡처
3. /profile/privacy 접속 → 개인정보 캡처
4. 각 화면별 체크:
   - 프로필 헤더 크기
   - 메뉴 항목 높이 (min-h-14)
   - Toggle 터치 타겟
   - 텍스트 가독성

#### Step 8: 디자인 개선안 도출
각 화면별로 다음 항목 분석:

**A. 레이아웃**
- 문제: [구체적인 레이아웃 문제]
- 원인: [CSS 클래스 또는 구조 문제]
- 개선안: [Before/After 코드]

**B. 타이포그래피**
- 문제: [폰트 크기, 줄 간격, 색상 대비]
- 원인: [클래스 또는 CSS 변수]
- 개선안: [구체적인 클래스 변경]

**C. 인터랙티브 요소**
- 문제: [버튼 크기, 간격, 상태]
- 원인: [터치 타겟 부족, 피드백 부족]
- 개선안: [크기/간격 조정, 애니메이션 추가]

**D. 색상 시스템**
- 문제: [명암 대비, 일관성]
- 원인: [컬러 팔레트 불일치]
- 개선안: [CSS 변수 또는 Tailwind 클래스]

**E. 애니메이션**
- 문제: [과도함, 부족함, 버벅임]
- 원인: [duration, easing, 성능]
- 개선안: [최적화된 애니메이션 설정]

**F. 피드백 & 상태**
- 문제: [로딩/에러/빈 상태 불명확]
- 원인: [UI 컴포넌트 부족]
- 개선안: [명확한 상태 UI 추가]

#### Step 9: 우선순위 분류
모든 이슈를 다음 기준으로 분류:

**P0 (Critical)**: 사용자 플로우 차단, 접근성 심각한 문제
**P1 (High)**: 사용자 경험 저하, 디자인 불일치
**P2 (Medium)**: 미세한 개선, 일관성 향상
**P3 (Low)**: 선택적 개선, 부가 기능

#### Step 10: 최종 보고서 작성
다음 형식으로 종합 보고서 생성:

```markdown
# 모바일 UX/UI 전체 감사 보고서

## 실행 요약
- 테스트 화면 수: X개
- 발견된 이슈: P0 X개, P1 X개, P2 X개, P3 X개
- 전체 평균 점수: X/10 → Y/10 (개선 후 예상)
- 권장 작업 시간: X시간

## 탭별 상세 분석
[각 탭별로 위 템플릿 적용]

## 우선순위별 개선 로드맵
[P0 → P1 → P2 → P3 순서로 작업 계획]

## 예상 효과
- 사용자 만족도: +X%
- 접근성 점수: +X점
- 디자인 일관성: +X%
```

### 작업 제약사항
- 각 화면 캡처 후 반드시 DOM snapshot으로 요소 크기 확인
- 스크린샷만으로 판단하지 말고 실제 DOM 검증
- Before/After 코드는 실제 파일에서 읽은 후 제시
- 추측하지 말고 실제 측정값 기반 개선안 제시

### 산출물
1. 스크린샷: mobile-audit/ 폴더에 모든 화면 저장
2. 보고서: MOBILE_UX_AUDIT_REPORT.md
3. 개선 코드: 우선순위별 파일 리스트

### 성공 기준
- [ ] 모든 탭 스크린샷 캡처 완료 (25+ 화면)
- [ ] 각 화면별 6개 분석 항목 체크 완료
- [ ] P0/P1 이슈 100% 식별
- [ ] 구체적인 Before/After 코드 제시
- [ ] 우선순위별 작업 시간 추정

지금 바로 시작하세요!
```

---

## 🎯 보너스: 고급 분석 항목

### 1. 성능 분석
```yaml
측정 항목:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - Time to Interactive (TTI)

도구:
  - browser_console_messages() - 콘솔 에러 확인
  - browser_network_requests() - 네트워크 성능
  - Lighthouse (선택)
```

### 2. 접근성 감사
```yaml
테스트 항목:
  - 키보드 네비게이션 (Tab 키로 모든 요소 접근)
  - ARIA 레이블 완전성
  - 색상 대비 측정 (4.5:1 이상)
  - 터치 타겟 크기 (44x44px)
  - Focus 표시 명확성

도구:
  - browser_snapshot() - aria-label 확인
  - 수동 측정 - 색상 대비, 크기
```

### 3. 반응형 테스트
```yaml
추가 뷰포트:
  - 320 x 568 (iPhone SE - 최소 지원)
  - 375 x 667 (iPhone 8)
  - 414 x 896 (iPhone 11 Pro Max)
  - 768 x 1024 (iPad)

테스트:
  - 레이아웃 깨짐 확인
  - 텍스트 잘림 확인
  - 스크롤 영역 확보
```

---

## 📚 참고 자료

### 1. 디자인 시스템
- `src/styles/variables.css` - CSS 변수
- `tailwind.config.js` - Tailwind 설정
- `src/design/tokens.ts` - 디자인 토큰

### 2. 현재 컴포넌트 구조
- `src/components/ui/` - UI 컴포넌트
- `src/components/chat/` - 채팅 컴포넌트
- `src/components/onboarding/` - 온보딩 컴포넌트
- `src/pages/` - 페이지 컴포넌트

### 3. 기존 개선 문서
- `CHAT_DESIGN_IMPROVEMENTS.md` - 채팅 개선안
- `DAYMODE_FINAL_REPORT.md` - 데이 모드 보고서
- `docs/WCAG_ACCESSIBILITY_FINAL_RECOMMENDATIONS.md` - 접근성 가이드

---

## 🔧 실행 예시

### 예시 1: 온보딩 웰컴 화면 분석

```typescript
// 1. 스크린샷 캡처
await browser_resize(390, 844);
await browser_navigate('https://iness-mlog.web.app/onboarding');
await browser_wait_for(2);
await browser_take_screenshot('mobile-audit/onboarding/01-welcome.png');

// 2. DOM 분석
const snapshot = await browser_snapshot();
// e37: 버튼 "대화 시작하기" 분석
// - 크기: 실제 DOM에서 width/height 확인
// - 간격: 주변 요소와의 gap 확인
// - 텍스트: 폰트 크기, 색상 확인

// 3. 개선안 도출
문제: 버튼 높이 h-14 (56px) - 충분하지만 padding 부족
개선: h-16 (64px) + py-4로 변경하여 더 명확한 터치 영역 확보

Before:
<Button className="w-full h-14 text-lg">대화 시작하기</Button>

After:
<Button className="w-full h-16 text-xl py-4">대화 시작하기</Button>

효과:
- ✅ 터치 타겟 64px로 증가
- ✅ 텍스트 크기 증가 (18px → 20px)
- ✅ 시각적 위계 강화
```

### 예시 2: 채팅 메시지 버블 분석

```typescript
// 1. 채팅 화면 진입
await browser_navigate('https://iness-mlog.web.app/chat');
await browser_click('e74'); // 괜찮아요 선택
await browser_click('e110'); // 대화 시작
await browser_wait_for(2);
await browser_take_screenshot('mobile-audit/chat/02-chat-initial.png');

// 2. DOM 분석
메시지 버블:
- AI: max-w-chat-bubble (tailwind.config.js에서 확인 필요)
- User: max-w-chat-bubble
- 간격: space-y-5
- Padding: px-5 py-4

// 3. 개선안
문제: 메시지 간 간격이 너무 좁음 (space-y-5 = 20px)
개선: space-y-6 (24px)로 증가

Before:
<div className="space-y-5">

After:
<div className="space-y-6">

효과:
- ✅ 메시지 구분 명확
- ✅ 가독성 향상
- ✅ 시각적 여유
```

### 예시 3: Quick Chips 개선

```typescript
// DOM 확인
Quick Chip 버튼:
- 크기: px-4 py-2.5
- 간격: gap-3
- 폰트: text-sm

// 개선안
문제: 아이콘이 없어서 시각적으로 단조로움
개선: Sparkles 아이콘 추가 + hover 애니메이션

Before:
<button className="px-4 py-2.5 bg-white/80 ...">
  {chip.text}
</button>

After:
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  className="px-4 py-2.5 bg-white/90 ... flex items-center gap-2"
>
  <Sparkles size={14} className="opacity-60" />
  {chip.text}
</motion.button>

효과:
- ✅ 시각적 흥미 증가
- ✅ 클릭 가능 요소 명확화
- ✅ 브랜드 특색 강화
```

---

## 📋 체크리스트

### 실행 전 확인
- [ ] 배포 사이트 정상 작동 확인 (https://iness-mlog.web.app)
- [ ] Browser Extension 정상 연결
- [ ] 로컬 스크린샷 폴더 쓰기 권한 확인

### 실행 중 확인
- [ ] 각 화면 로딩 완료 대기 (최소 2초)
- [ ] DOM snapshot으로 요소 존재 확인
- [ ] 스크린샷 파일 저장 확인 (파일명 규칙 준수)
- [ ] 브라우저 콘솔 에러 확인 (browser_console_messages)

### 실행 후 확인
- [ ] 총 25+ 스크린샷 생성 확인
- [ ] 각 화면별 분석 완료
- [ ] P0/P1 이슈 100% 식별
- [ ] 개선안 코드 구체성 (Before/After)
- [ ] 우선순위 및 작업 시간 추정

---

## 🎬 최종 산출물 목록

1. **스크린샷** (25+ 파일)
   - `mobile-audit/onboarding/` - 6개
   - `mobile-audit/chat/` - 6개
   - `mobile-audit/journal/` - 3개
   - `mobile-audit/reports/` - 2개
   - `mobile-audit/content/` - 4개
   - `mobile-audit/profile/` - 3개

2. **보고서** (1개)
   - `MOBILE_UX_AUDIT_REPORT.md` - 종합 보고서

3. **개선 코드 목록** (우선순위별)
   - P0_CRITICAL_FIXES.md
   - P1_HIGH_PRIORITY_IMPROVEMENTS.md
   - P2_MEDIUM_IMPROVEMENTS.md

---

## 🚀 시작 명령어

```bash
# 에이전트 모드로 전환 후:
"모바일 UX 전체 감사 시작해줘. AGENT_PROMPT_MOBILE_UX_AUDIT.md의 프롬프트대로 진행해."
```

또는

```bash
"배포된 사이트의 모든 탭을 모바일 뷰포트로 캡처하고 디자인 개선안을 도출해줘. 
온보딩, 채팅, 기록, 통계, 콘텐츠, 프로필 순서로 진행하고, 
각 화면마다 레이아웃/타이포그래피/인터랙티브 요소/색상/애니메이션/피드백 항목을 체크해서 
P0~P3 우선순위로 개선안을 제시해."
```

---

**이 프롬프트를 사용하면 체계적이고 상세한 모바일 UX 감사가 가능합니다!** 🎯
