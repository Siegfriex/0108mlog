# 모바일 UX 상세 구현 가이드

**기준**: MOBILE_UX_IMPROVEMENT_REPORT_20260120.md v2.0  
**작성일**: 2026-01-20  
**현재 상태**: NoiseOverlay, GlassCard 이미 구현됨 ✅  
**작업 방식**: 기존 컴포넌트 활용 + 스타일 개선

---

## 실행 요약

현재 코드베이스에 이미 `NoiseOverlay.tsx`, `GlassCard.tsx` 등 기본 컴포넌트가 구현되어 있습니다. 이를 활용하여 MOBILE_UX_IMPROVEMENT_REPORT의 디자인을 적용합니다. 35개 스크린을 4개 Phase로 나누어 순차적으로 개선합니다.

---

## Phase별 파일 매핑

### Phase 1: Global (3개 파일, 1일)

| 파일 | 작업 | 난이도 |
|------|------|--------|
| `tailwind.config.js` | 애니메이션, boxShadow 확장 | Easy |
| `src/styles/utilities.css` | glass-crystal, glow 유틸리티 추가 | Easy |
| `src/components/ui/FloatingOrbs.tsx` | 신규 생성 (배경 Orbs) | Medium |

### Phase 2: Onboarding & Chat (12개 파일, 3-4일)

#### Onboarding (6개 파일)

| 파일 | 현재 상태 | 주요 개선 사항 | 예상 시간 |
|------|----------|---------------|----------|
| `WelcomeScreen.tsx` | 있음 | FloatingOrbs 배경 추가 | 30분 |
| `PermissionRequest.tsx` | 있음 | 아이콘 감성화, 카드 스타일 | 1시간 |
| `InitialAssessment.tsx` | 있음 | 감정 평가 카드 Gemstone 스타일 | 1시간 |
| `GoalSetting.tsx` | 있음 | 선택 카드 Floating 효과 | 1시간 |
| `PersonalizationSetup.tsx` | 있음 | Glass Panel 스타일 | 30분 |
| `TutorialGuide.tsx` | 있음 | 인터랙티브 요소 강화 | 1시간 |

#### Chat (6개 파일)

| 파일 | 현재 상태 | 주요 개선 사항 | 예상 시간 |
|------|----------|---------------|----------|
| `EmotionSelectModal.tsx` | 있음, data-testid 추가됨 | Gemstone 스타일, Specular Highlight | 2시간 |
| `DayMode.tsx` | 있음, data-testid 추가됨 | Adaptive Blur 헤더, 메시지 버블 개선 | 2시간 |
| `NightMode.tsx` | 있음, data-testid 추가됨 | CelestialBackground 강화 | 1시간 |
| `QuickChip.tsx` | 있음, data-testid 추가됨 | Glass 스타일 강화 | 30분 |
| `AIThinkingAnimation.tsx` | 있음 | Pulse 효과 강화 | 30분 |
| `SmartContextTag.tsx` | 있음 | 태그 선택 모달 Glass 스타일 | 1시간 |

### Phase 3: Journal & Reports (8개 파일, 2-3일)

#### Journal (4개 파일)

| 파일 | 현재 상태 | 주요 개선 사항 | 예상 시간 |
|------|----------|---------------|----------|
| `JournalTimeline.tsx` | 있음 | Glowing Timeline Dots | 1시간 |
| `components/JournalView.tsx` | 있음, data-testid 추가됨 | Glass Timeline Cards | 2시간 |
| `JournalSearch.tsx` | 있음 | 검색 입력 Glass 스타일 | 1시간 |
| `JournalJourney.tsx` | 있음 | Sankey 차트 Neon 효과 | 2시간 |

#### Reports (4개 파일)

| 파일 | 현재 상태 | 주요 개선 사항 | 예상 시간 |
|------|----------|---------------|----------|
| `WeeklyReport.tsx` | 있음 | 차트 Neon Glow 효과 | 2시간 |
| `MonthlyReport.tsx` | 있음 | 홀로그램 데이터 시각화 | 2시간 |
| `MonthlyRetrospective.tsx` | 있음 | 서사 텍스트 스타일링 | 1시간 |
| `MonitorDashboard.tsx` | 있음 | 실시간 Pulse 효과 | 2시간 |

### Phase 4: Content, Profile, Safety (15개 파일, 2-3일)

#### Content (5개 파일)

| 파일 | 주요 개선 사항 | 예상 시간 |
|------|---------------|----------|
| `ContentMain.tsx` | Frosted Glass Overlay on Images | 1시간 |
| `ContentPoems.tsx` | PoemCard Glass 스타일 | 1시간 |
| `ContentMeditations.tsx` | 명상 카드 Ambient 효과 | 1시간 |
| `ContentMusic.tsx` | 음악 카드 Wave 효과 | 1시간 |
| `ContentImmersion.tsx` | 진정한 Immersive 모드 (UI 숨김) | 1시간 |

#### Profile (7개 파일)

| 파일 | 주요 개선 사항 | 예상 시간 |
|------|---------------|----------|
| `ProfileMain.tsx` | 프로필 헤더 Glass 스타일 | 1시간 |
| `Settings.tsx` | Floating List Items | 1.5시간 |
| `PersonaSettings.tsx` | 페르소나 카드 개선 | 1시간 |
| `DayNightSettings.tsx` | 토글 스위치 개선 | 30분 |
| `Privacy.tsx` | Glass Panel 스타일 | 30분 |
| `PrivacyPolicy.tsx` | 읽기 편한 타이포그래피 | 30분 |
| `Conversations.tsx` | 대화 목록 Glass Cards | 1시간 |

#### Safety (3개 파일)

| 파일 | 주요 개선 사항 | 예상 시간 |
|------|---------------|----------|
| `SafetyMain.tsx` | Warm Shield 스타일 | 1.5시간 |
| `CrisisSupport.tsx` | 부드러운 코랄 톤, 보호 느낌 | 1.5시간 |
| `CopingTools.tsx` | 도구 카드 Glass 스타일 | 1시간 |

---

## 구현 세부 사항

### 1. 신규 컴포넌트 생성

#### `src/components/ui/FloatingOrbs.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';

export const FloatingOrbs: React.FC = () => {
  return (
    <>
      {/* Primary Orb - 좌상단 */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Secondary Orb - 우하단 */}
      <motion.div 
        className="absolute bottom-[-10%] right-[-20%] w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] bg-brand-secondary/20 rounded-full blur-[80px] pointer-events-none"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </>
  );
};
```

### 2. Global CSS 유틸리티 추가

**파일**: `src/styles/utilities.css` (신규 또는 src/index.css에 추가)

```css
@layer utilities {
  /* ============================================
   * Ethereal Crystal Design System Utilities
   * ============================================ */

  /* Glass Crystal - 기본 유리 질감 */
  .glass-crystal {
    @apply bg-white/60 backdrop-blur-xl 
           border border-white/40 
           shadow-glass
           relative overflow-hidden;
  }

  /* Glass Border - 얇고 세련된 윤곽선 */
  .glass-border {
    @apply border border-white/20;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  /* Glass Panel - 강화된 유리 (모달, 카드) */
  .glass-panel {
    @apply bg-white/80 backdrop-blur-2xl
           border border-white/60
           shadow-glass-hover;
  }

  /* Floating Shadow - 공중에 떠 있는 효과 */
  .shadow-floating {
    box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.1),
                0 10px 30px -10px rgba(0, 0, 0, 0.05);
  }

  /* Neon Glow - 네온 빛나는 효과 */
  .glow-primary {
    box-shadow: 0 0 10px rgba(255, 107, 157, 0.3),
                0 0 20px rgba(255, 107, 157, 0.2);
  }

  .glow-primary-lg {
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.4),
                0 0 40px rgba(255, 107, 157, 0.3);
  }

  /* Specular Highlight - 반사광 */
  .specular-highlight {
    position: relative;
  }
  .specular-highlight::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 40%;
    height: 20%;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 9999px;
    filter: blur(4px);
    transform: rotate(-15deg);
    pointer-events: none;
  }

  /* Inner Glow - 내부 빛나는 효과 (선택된 카드) */
  .inner-glow {
    position: relative;
  }
  .inner-glow::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(255, 107, 157, 0.1), transparent);
    opacity: 0.5;
    pointer-events: none;
  }

  /* Reduced Motion 지원 */
  @media (prefers-reduced-motion: reduce) {
    .animate-float,
    .animate-pulse-slow,
    .animate-blob {
      animation: none;
    }
  }
}
```

### 3. Tailwind 설정 확장

**파일**: `tailwind.config.js`

**추가 내용** (기존 설정 유지하고 extend 섹션에 추가):

```javascript
// tailwind.config.js의 theme.extend에 추가
animation: {
  'float': 'float 6s ease-in-out infinite',
  'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'glow': 'glow 2s ease-in-out infinite alternate',
  // 기존 animation 유지...
},
keyframes: {
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
  },
  glow: {
    '0%': { boxShadow: '0 0 5px rgba(255, 107, 157, 0.3)' },
    '100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.6)' },
  },
  // 기존 keyframes 유지...
},
boxShadow: {
  'neon': '0 0 10px rgba(255, 107, 157, 0.5), 0 0 20px rgba(255, 107, 157, 0.3)',
  'neon-lg': '0 0 20px rgba(255, 107, 157, 0.6), 0 0 40px rgba(255, 107, 157, 0.4)',
  'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
  'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
  // 기존 boxShadow 유지...
},
backdropBlur: {
  'xs': '2px',
  'xl': '20px',
  '2xl': '40px',
  // 기존 backdropBlur 유지...
},
```

---

## 파일별 상세 구현 가이드

### Phase 2-A: Onboarding 스크린 (6개)

#### 1. WelcomeScreen.tsx

**현재 경로**: `src/components/onboarding/WelcomeScreen.tsx`

**수정 사항**:
```tsx
import { FloatingOrbs } from '../ui/FloatingOrbs';
import { NoiseOverlay } from '../ui/NoiseOverlay';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <OnboardingContainer>
      <OnboardingSection spacing="centered" align="center">
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingOrbs />
          <NoiseOverlay opacity={0.04} />
        </div>

        {/* Content - relative z-10으로 위에 표시 */}
        <div className="relative z-10 flex flex-col items-center">
          {/* 로고 with Specular Highlight */}
          <div className="relative w-32 h-32 mb-8 specular-highlight">
            <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-neon-lg">
              <Sparkles size={60} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-800 mb-3">마음로그</h1>
          <p className="text-slate-500 text-center mb-12">내 마음을 읽어주는 영혼의 단짝</p>

          <Button 
            onClick={onStart}
            className="glass-panel px-12 py-4 rounded-2xl text-brand-primary font-bold hover:shadow-floating transition-all"
          >
            시작하기
          </Button>
        </div>
      </OnboardingSection>
    </OnboardingContainer>
  );
};
```

#### 2. GoalSetting.tsx

**현재 경로**: `src/components/onboarding/GoalSetting.tsx`

**수정 사항**:
```tsx
// 기존 import 유지...

export const GoalSetting: React.FC<GoalSettingProps> = ({ data, onUpdate, onNext, onBack, onSkip }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>(data.selectedGoal);

  const GOALS = [
    { id: 'pattern', title: '감정 패턴 이해', icon: <Brain size={24} />, description: '반복되는 감정 패턴을 파악하고 싶어요' },
    { id: 'management', title: '일상 자기관리', icon: <Heart size={24} />, description: '매일 나를 돌보는 습관을 만들고 싶어요' },
    { id: 'stress', title: '스트레스 관리', icon: <Wind size={24} />, description: '스트레스를 효과적으로 다루고 싶어요' },
  ];

  return (
    <OnboardingContainer>
      <OnboardingSection spacing="normal" align="center">
        {/* Background */}
        <div className="absolute inset-0">
          <NoiseOverlay opacity={0.03} />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">목표 설정</h2>
          <p className="text-base text-slate-500 text-center mb-8">
            어떤 여정을 함께할까요?
          </p>

          {/* Goal Cards with Floating Effect */}
          <div className="space-y-4">
            {GOALS.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              
              return (
                <motion.button
                  key={goal.id}
                  data-testid={`goal-card-${goal.id}`}
                  onClick={() => {
                    setSelectedGoal(goal.id);
                    onUpdate({ selectedGoal: goal.id });
                  }}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -4 }}
                  className={`
                    relative w-full overflow-hidden p-6 rounded-3xl text-left transition-all duration-500
                    ${isSelected 
                      ? 'bg-white/80 shadow-floating border-2 border-brand-primary/30' 
                      : 'bg-white/40 border border-white/40 hover:bg-white/60 shadow-glass'}
                    backdrop-blur-xl
                  `}
                >
                  {/* Inner Glow for Selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent opacity-50" />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Icon Container */}
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isSelected 
                        ? 'bg-brand-primary text-white shadow-neon' 
                        : 'bg-white/50 text-slate-400'}
                    `}>
                      {goal.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 transition-colors ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                        {goal.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {goal.description}
                      </p>
                    </div>

                    {/* Check Icon */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white"
                      >
                        <Check size={14} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" onClick={onSkip} className="flex-1">
              건너뛰기
            </Button>
            <Button 
              variant="primary" 
              onClick={onNext} 
              disabled={!selectedGoal}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </div>
      </OnboardingSection>
    </OnboardingContainer>
  );
};
```

#### 3. InitialAssessment.tsx

**개선 사항**: 감정 평가 버튼을 Gemstone 스타일로

```tsx
// 질문 1: 감정 상태 버튼
<motion.button
  key={option.value}
  data-testid={`emotion-rating-${option.value}`}
  onClick={() => handleQuestion1Complete(option.value)}
  whileHover={{ y: -4, scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="relative group"
>
  {/* Glow Background */}
  <div className={`absolute inset-0 ${option.color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />

  {/* Gemstone Container */}
  <div className={`
    relative w-20 h-20 rounded-[20px] 
    bg-gradient-to-br from-white/90 to-white/40
    border border-white/60 shadow-lg
    flex flex-col items-center justify-center
    transition-all duration-300
  `}>
    {option.icon}
    
    {/* Specular Highlight */}
    <div className="absolute top-2 left-2 w-8 h-4 bg-white/40 rounded-full blur-[2px] rotate-[-15deg]" />
  </div>

  <span className="block text-xs font-medium text-slate-600 mt-2">
    {option.label}
  </span>
</motion.button>
```

---

### Phase 2-B: Chat 스크린 (6개)

#### 4. EmotionSelectModal.tsx

**현재 상태**: 이미 data-testid 추가됨  
**추가 개선**: Gemstone 스타일 강화

```tsx
// 감정 버튼을 EmotionOrb에서 직접 Gemstone 스타일로 변경
{EMOTIONS_CONFIG.map((emotion, index) => {
  const isSelected = selectedEmotion === emotion.id;
  
  return (
    <motion.button
      key={emotion.id}
      data-testid={`emotion-${emotion.id}`}
      onClick={() => onEmotionSelect(emotion.id)}
      whileHover={{ y: -6, scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative group"
    >
      {/* Ambient Glow */}
      <div className={`
        absolute inset-0 ${emotion.color} blur-2xl 
        opacity-${isSelected ? '40' : '20'} 
        group-hover:opacity-50 
        transition-opacity duration-300
      `} />

      {/* Gemstone Button */}
      <div className={`
        relative w-24 h-24 rounded-[28px] 
        bg-gradient-to-br from-white/90 via-white/60 to-white/40
        border-2 ${isSelected ? 'border-brand-primary/50' : 'border-white/60'}
        flex flex-col items-center justify-center
        transition-all duration-300
        ${isSelected ? 'shadow-neon-lg' : 'shadow-lg'}
      `}>
        <div className={`${emotion.color} text-4xl mb-1`}>
          {emotion.icon}
        </div>
        
        {/* Specular Highlight */}
        <div className="absolute top-3 left-3 w-12 h-6 bg-white/50 rounded-full blur-[3px] rotate-[-18deg]" />
        
        {/* Inner Glow for Selected */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-[28px]" />
        )}
      </div>

      {/* Label */}
      <span className={`
        block text-sm font-bold mt-3 transition-colors
        ${isSelected ? 'text-brand-primary' : 'text-slate-600'}
      `}>
        {emotion.label}
      </span>
    </motion.button>
  );
})}
```

#### 5. DayMode.tsx - Adaptive Blur Header

**현재 상태**: 이미 data-testid 추가됨  
**추가 개선**: 스크롤 기반 Adaptive Blur

```tsx
const DayModeComponent: React.FC<DayModeProps> = ({ persona, onSave, ... }) => {
  const [scrollY, setScrollY] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 스크롤 리스너
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Portal>
      <AnimatePresence>
        {showChat && (
          <motion.div data-testid="day-mode" className="fixed inset-0 z-modal flex flex-col">
            {/* Adaptive Blur Header */}
            <motion.header
              className="shrink-0 flex items-center justify-between px-8 py-6"
              style={{
                background: scrollY > 20 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: scrollY > 20 ? 'blur(20px)' : 'blur(10px)',
                borderBottom: scrollY > 20 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Header Content */}
            </motion.header>

            {/* Messages - ref 추가 */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >
              {/* Messages with Enhanced Glass Style */}
              {displayMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  data-testid={msg.role === 'user' ? 'user-message' : 'ai-message'}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`
                    p-4 rounded-2xl 
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-neon ml-auto max-w-[75%]'
                      : 'bg-white/90 backdrop-blur-xl text-slate-900 border border-white/70 shadow-glass mr-auto max-w-[80%]'}
                    transition-all duration-300
                  `}
                >
                  {/* AI 메시지에 Specular Highlight */}
                  {msg.role === 'assistant' && (
                    <div className="absolute top-2 right-2 w-16 h-8 bg-white/20 rounded-full blur-sm rotate-12 pointer-events-none" />
                  )}
                  
                  <p className="relative z-10">{msg.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};
```

---

### Phase 3: Journal & Reports (8개)

#### 6. JournalView.tsx (components/)

**현재 상태**: data-testid 추가됨  
**추가 개선**: Glowing Timeline Dots

```tsx
// Timeline with Glowing Dots
<div className="relative pl-8 border-l-2 border-gradient-to-b from-brand-primary/20 via-brand-primary/10 to-transparent ml-4 space-y-8">
  {timelineData.map((entry, idx) => (
    <div key={entry.id} className="relative group">
      {/* Glowing Timeline Dot */}
      <motion.div 
        className="absolute -left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-brand-primary/20 shadow-neon"
        whileHover={{ scale: 1.3 }}
        animate={{
          boxShadow: [
            '0 0 10px rgba(255, 107, 157, 0.3)',
            '0 0 20px rgba(255, 107, 157, 0.5)',
            '0 0 10px rgba(255, 107, 157, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Enhanced Glass Card */}
      <motion.div
        data-testid="timeline-entry"
        onClick={() => handleViewDetail(entry.id)}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="
          cursor-pointer p-5 rounded-3xl 
          bg-white/50 backdrop-blur-md 
          border border-white/60
          shadow-glass hover:shadow-floating
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-3 mb-3">
          {/* Emotion Icon with Specular */}
          <div data-testid="emotion-icon" className={`
            ${getEmotionColor(entry.emotion)} 
            p-3 rounded-xl bg-white/80 shadow-sm 
            specular-highlight
          `}>
            {getEmotionIcon(entry.emotion, 22)}
          </div>

          {/* Intensity Badge with Glow */}
          <span data-testid="intensity-badge" className={`
            px-3 py-1.5 rounded-full text-xs font-bold 
            ${getIntensityColor(entry.intensity)} 
            ${entry.intensity >= 8 ? 'shadow-neon' : 'shadow-sm'}
          `}>
            강도 {entry.intensity}/10
          </span>
        </div>
        
        <p className="text-slate-700 leading-relaxed">{entry.summary}</p>
        <span className="text-xs text-slate-400 mt-2 block">{entry.time}</span>
      </motion.div>
    </div>
  ))}
</div>
```

#### 7. WeeklyReport.tsx

**추가 개선**: 차트에 Neon Glow 효과

```tsx
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const WeeklyReport: React.FC = () => {
  const chartData = useEmotionChartData('weekly');

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">주간 리포트</h1>

      {/* Neon Chart */}
      <div className="glass-panel p-6 rounded-[2rem] mb-6">
        <h3 className="font-bold text-slate-700 mb-4">감정 트렌드</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              {/* Glow Filter */}
              <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradient Fill */}
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(255, 107, 157)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(255, 107, 157)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            />

            {/* Area with Glow Effect */}
            <Area 
              type="monotone" 
              dataKey="intensity" 
              stroke="rgb(255, 107, 157)" 
              strokeWidth={3}
              fill="url(#fillGradient)"
              filter="url(#glow)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Card */}
      <div className="glass-crystal p-6 rounded-3xl">
        <h3 className="font-bold text-slate-700 mb-3">이번 주 인사이트</h3>
        <p className="text-slate-600 leading-relaxed">
          {weeklyInsights}
        </p>
      </div>
    </div>
  );
};
```

---

### Phase 4: Content, Profile, Safety (15개)

#### 8. ContentMain.tsx

**추가 개선**: Frosted Glass Overlay on Images

```tsx
export const ContentMain: React.FC = () => {
  const categories = [
    { id: 'poems', title: '시', subtitle: '감정을 담은 시선', image: '/img/category-poems.jpg' },
    { id: 'meditations', title: '명상', subtitle: '마음의 안정', image: '/img/category-meditations.jpg' },
    { id: 'music', title: '음악', subtitle: '치유의 선율', image: '/img/category-music.jpg' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">콘텐츠</h1>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div 
            key={category.id}
            data-testid={`category-${category.id}`}
            className="relative h-48 rounded-[2rem] overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/content/${category.id}`)}
          >
            {/* Background Image with Zoom Effect */}
            <img 
              src={category.image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={category.title}
            />

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Frosted Glass Text Overlay */}
            <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <h3 className="text-white font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                {category.title}
              </h3>
              <p className="text-white/90 text-sm mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {category.subtitle}
              </p>
            </div>

            {/* Hover Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 9. Settings.tsx

**추가 개선**: Floating Glass List Items

```tsx
export const Settings: React.FC = () => {
  const settingsItems = [
    { id: 'notifications', label: '알림 설정', icon: <Bell size={20} />, value: true },
    { id: 'theme', label: '테마 설정', icon: <Moon size={20} />, value: false },
    { id: 'privacy', label: '개인정보 보호', icon: <Lock size={20} />, value: true },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-white">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">설정</h1>

      {/* Floating Glass Cards */}
      <div className="space-y-3">
        {settingsItems.map((item) => (
          <motion.div
            key={item.id}
            data-testid={`setting-${item.id}`}
            whileTap={{ scale: 0.98 }}
            className="
              flex items-center justify-between p-4 rounded-2xl
              bg-white/60 backdrop-blur-sm border border-white/70
              shadow-glass hover:shadow-floating
              active:bg-white/80
              transition-all duration-300
            "
          >
            {/* Left: Icon + Label */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center text-brand-primary">
                {item.icon}
              </div>
              <span className="text-slate-700 font-medium">{item.label}</span>
            </div>

            {/* Right: Toggle */}
            <Switch 
              checked={item.value} 
              onChange={(checked) => handleToggle(item.id, checked)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
```

#### 10. CrisisSupport.tsx

**추가 개선**: Warm Shield 스타일 (부드러운 코랄 톤)

```tsx
export const CrisisSupport: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-rose-50/50 to-white">
      {/* Comforting Crisis Card */}
      <div className="
        w-full max-w-md p-8 rounded-[2.5rem] text-center
        bg-gradient-to-b from-rose-50/90 to-white/90
        backdrop-blur-2xl border-2 border-rose-100
        shadow-[0_20px_40px_-10px_rgba(244,63,94,0.2)]
      ">
        {/* Icon with Soft Glow */}
        <div className="w-24 h-24 mx-auto bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-[0_8px_20px_rgba(244,63,94,0.15)]">
          <ShieldHeart size={48} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          혼자가 아니에요
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          지금 바로 도움을 받을 수 있습니다.
        </p>

        {/* Emergency Button */}
        <Button className="
          w-full h-14 rounded-2xl font-bold text-lg
          bg-gradient-to-r from-rose-500 to-rose-600 
          text-white 
          shadow-[0_8px_20px_rgba(244,63,94,0.3)]
          hover:shadow-[0_12px_30px_rgba(244,63,94,0.4)]
          active:scale-[0.98]
          transition-all duration-300
        ">
          <Phone size={20} className="mr-2" />
          24시간 상담 전화 연결
        </Button>

        {/* Secondary Actions */}
        <div className="mt-4 space-y-2">
          <button className="w-full p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 text-slate-700 hover:bg-white/80 transition-all">
            대처 도구 보기
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 구현 순서 및 검증

### 1단계: Phase 1 (1일)
```bash
# 1. Tailwind 설정 업데이트
# tailwind.config.js 수정

# 2. Global CSS 추가
# src/styles/utilities.css 생성 또는 src/index.css에 추가

# 3. FloatingOrbs 컴포넌트 생성
# src/components/ui/FloatingOrbs.tsx

# 4. 빌드 및 검증
npm run build
```

### 2단계: Phase 2-A (Onboarding, 2일)
```bash
# 각 파일 수정 후 즉시 검증
npm run dev  # 로컬 서버 실행
# 브라우저에서 /onboarding 확인

# 모바일 뷰 테스트 (Chrome DevTools)
# F12 > Toggle device toolbar > iPhone 14 Pro
```

### 3단계: Phase 2-B (Chat, 2일)
```bash
# DayMode, NightMode 수정 후
# /chat 페이지 검증

# 감정 선택 → 대화 → 저장까지 전체 플로우 테스트
```

### 4단계: Phase 3 (Journal & Reports, 2-3일)
```bash
# /journal, /reports/weekly 검증
# 차트 렌더링 확인
```

### 5단계: Phase 4 (나머지, 2-3일)
```bash
# /content, /profile, /safety 검증
```

### 6단계: 전체 검증 및 배포 (1일)
```bash
# 전체 빌드
npm run build

# 배포
firebase deploy --only hosting

# E2E 테스트 (UI 모드)
npm run test:e2e:ui
```

---

## 예상 효과

### Before (현재)
- 평면적인 카드 디자인
- 단순한 그라데이션 배경
- 정적인 UI 요소

### After (개선 후)
- 입체감 있는 Glass 디자인
- 움직이는 Floating Orbs 배경
- 인터랙티브한 UI 요소 (Glow, Lift, Shimmer)

### 측정 지표
- 디자인 품질: ★★★☆☆ → ★★★★★
- 몰입도: ★★★☆☆ → ★★★★★
- 브랜드 정체성: ★★★☆☆ → ★★★★☆

---

## 파일 변경 요약

| Phase | 신규 생성 | 수정 | 총계 |
|-------|---------|------|------|
| Phase 1 | 2개 | 2개 | 4개 |
| Phase 2 | 0개 | 12개 | 12개 |
| Phase 3 | 0개 | 8개 | 8개 |
| Phase 4 | 0개 | 15개 | 15개 |
| **총계** | **2개** | **37개** | **39개** |

---

## 다음 단계

1. Phase 1부터 시작할까요?
2. 특정 스크린부터 시작할까요? (예: 온보딩, 채팅)
3. 전체 파일 목록을 먼저 확인할까요?
