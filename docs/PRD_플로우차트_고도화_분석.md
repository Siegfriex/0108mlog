# 마음로그 V5.0 플로우차트 고도화 분석 및 개선 제안서

**작성일**: 2025-01-15  
**분석자**: UX/UI 디자이너 & 프론트엔드 개발자  
**분석 대상**: PRD.md 플로우차트 섹션 (2.4 유저 플로우, 2.5 태스크 플로우)  
**목적**: 플로우차트의 완전성, 명확성, 실행 가능성 향상

---

## 목차

1. [현재 플로우차트 분석](#1-현재-플로우차트-분석)
2. [플로우차트 문제점 및 개선 필요 사항](#2-플로우차트-문제점-및-개선-필요-사항)
3. [고도화된 플로우차트 제안](#3-고도화된-플로우차트-제안)
4. [예외 처리 및 에러 경로 상세화](#4-예외-처리-및-에러-경로-상세화)
5. [상태 머신 다이어그램](#5-상태-머신-다이어그램)
6. [사용자 여정 맵 (User Journey Map)](#6-사용자-여정-맵-user-journey-map)
7. [개선 우선순위 및 실행 계획](#7-개선-우선순위-및-실행-계획)

---

## 1. 현재 플로우차트 분석

### 1.1 현재 플로우차트 구조

PRD.md에는 다음 3개의 주요 플로우가 정의되어 있습니다:

1. **플로우 1: 온보딩** (라인 1799-1895)
   - 6단계 구조
   - 텍스트 기반 플로우차트
   - 조건 분기 부족

2. **플로우 2: 대화형 일일 감정 체크인** (라인 1897-1988)
   - 상세 플로우차트
   - 비동기 처리 명시
   - 예외 처리 부족

3. **플로우 3: 위기 상황 대응** (라인 1989-2026)
   - 간단한 플로우차트
   - 위기 감지 알고리즘 미명시

### 1.2 현재 플로우차트의 강점

✅ **명확한 단계 구분**: 각 플로우가 단계별로 잘 구분됨  
✅ **비동기 처리 명시**: AI 인사이트 생성 등 비동기 작업 표시  
✅ **선택적 단계 표시**: 스킵 가능한 단계 명시

### 1.3 현재 플로우차트의 문제점

#### 🔴 Critical: 시각적 표현 부족
- **문제**: 텍스트 기반 플로우차트로 시각적 이해 어려움
- **영향**: 개발자/디자이너 간 소통 비효율
- **해결**: Mermaid 다이어그램 또는 플로우차트 도구 활용

#### 🔴 Critical: 예외 처리 경로 부족
- **문제**: 에러 케이스 및 예외 상황 처리 경로 불명확
- **영향**: 개발 시 엣지 케이스 처리 누락 가능성
- **해결**: 모든 분기점에 예외 처리 경로 추가

#### 🟡 Medium: 병렬 처리 명시 부족
- **문제**: 동시에 실행 가능한 작업이 순차적으로 표시됨
- **영향**: 성능 최적화 기회 놓침
- **해결**: 병렬 처리 가능 작업 명시

#### 🟡 Medium: 상태 전환 불명확
- **문제**: 각 단계 간 상태 전환 조건 불명확
- **영향**: 상태 관리 로직 설계 어려움
- **해결**: 상태 머신 다이어그램 추가

---

## 2. 플로우차트 문제점 및 개선 필요 사항

### 2.1 플로우 1: 온보딩

#### 문제점
1. **진행 상태 표시 부재**: 사용자가 어느 단계인지 알 수 없음
2. **뒤로가기 처리 미명시**: 각 단계에서 뒤로가기 시 동작 불명확
3. **에러 처리 부족**: 네트워크 오류, 권한 거부 등 예외 상황 처리 없음
4. **조건 분기 불명확**: 스킵 가능 여부가 단계별로 다르나 명확한 분기 없음

#### 개선 필요 사항
- 진행 바 추가
- 뒤로가기 동작 명시
- 에러 처리 경로 추가
- 조건 분기 다이어그램 추가

### 2.2 플로우 2: 대화형 일일 감정 체크인

#### 문제점
1. **Day/Night Mode 분기 부재**: 핵심 기능인 모드 전환이 플로우에 없음
2. **감정 선택 UI 불명확**: 칩 선택과 자유 입력의 우선순위 불명확
3. **스마트 태그 타이밍 불명확**: 언제 추천되는지 불명확
4. **재시도 로직 부족**: AI 인사이트 실패 시 재시도 플로우 불명확
5. **오프라인 처리 부족**: 네트워크 없을 때 처리 방법 없음

#### 개선 필요 사항
- Day/Night Mode 분기 추가
- 감정 선택 UI 플로우 명확화
- 스마트 태그 추천 타이밍 명시
- 재시도 및 폴백 로직 상세화
- 오프라인 처리 경로 추가

### 2.3 플로우 3: 위기 상황 대응

#### 문제점
1. **위기 감지 알고리즘 부재**: 감지 기준 및 로직 없음
2. **복귀 경로 불명확**: 안정화 후 원래 화면으로 복귀하는 방법 불명확
3. **오탐 처리 부족**: 오탐 시 사용자 경험 처리 없음
4. **전문가 연결 플로우 부족**: 프리미엄 사용자 연결 과정 없음

#### 개선 필요 사항
- 위기 감지 알고리즘 플로우 추가
- 복귀 경로 명시
- 오탐 처리 로직 추가
- 전문가 연결 플로우 상세화

---

## 3. 고도화된 플로우차트 제안

### 3.1 플로우 1: 온보딩 (고도화 버전)

```mermaid
flowchart TD
    Start([앱 시작]) --> CheckFirstVisit{첫 방문 확인}
    CheckFirstVisit -->|첫 방문| OnboardingStart[온보딩 시작]
    CheckFirstVisit -->|재방문| ChatScreen[채팅 화면 /chat]
    
    OnboardingStart --> Step1[1단계: 환영 화면]
    Step1 -->|시작하기 클릭| Step2[2단계: 권한 요청]
    Step1 -->|뒤로가기| ExitConfirm{종료 확인?}
    ExitConfirm -->|예| AppExit[앱 종료]
    ExitConfirm -->|아니오| Step1
    
    Step2 -->|알림 권한| NotifPermission{알림 권한}
    Step2 -->|위치 권한| LocationPermission{위치 권한}
    NotifPermission -->|동의| NotifGranted[알림 활성화]
    NotifPermission -->|거부| NotifDenied[알림 비활성화]
    LocationPermission -->|동의| LocationGranted[GPS 활성화]
    LocationPermission -->|거부| LocationDenied[스마트 태그 제한]
    NotifGranted --> Step2Next{다음 단계}
    NotifDenied --> Step2Next
    LocationGranted --> Step2Next
    LocationDenied --> Step2Next
    Step2Next -->|다음| Step3[3단계: 초기 평가]
    Step2Next -->|뒤로가기| Step1
    
    Step3 --> Q1[질문 1: 감정 상태]
    Q1 --> Q2[질문 2: 필요한 도움]
    Q2 --> Q3[질문 3: 체크인 목표]
    Q3 --> Step3Next{다음 또는 스킵}
    Step3Next -->|다음| Step4[4단계: 목표 설정]
    Step3Next -->|스킵| Step4
    Step3Next -->|뒤로가기| Step2
    
    Step4 --> GoalSelect[목표 카드 선택]
    GoalSelect -->|기본값| DefaultGoal[일상 자기관리]
    GoalSelect -->|선택| CustomGoal[사용자 선택]
    DefaultGoal --> Step4Next{다음 또는 스킵}
    CustomGoal --> Step4Next
    Step4Next -->|다음| Step5[5단계: 개인화 설정]
    Step4Next -->|스킵| Step5
    Step4Next -->|뒤로가기| Step3
    
    Step5 --> NotifTime[알림 시간 설정]
    NotifTime --> NotifFreq[알림 빈도 설정]
    NotifFreq --> Step5Next{다음 또는 스킵}
    Step5Next -->|다음| Step6[6단계: 첫 체크인 가이드]
    Step5Next -->|스킵| Step6
    Step5Next -->|뒤로가기| Step4
    
    Step6 --> Tutorial1[튜토리얼 1: 감정 입력]
    Tutorial1 --> Tutorial2[튜토리얼 2: AI 피드백]
    Tutorial2 --> Tutorial3[튜토리얼 3: 액션 시작]
    Tutorial3 --> Step6Next{시작하기 또는 스킵}
    Step6Next -->|시작하기| FirstCheckin[첫 체크인 유도]
    Step6Next -->|스킵| FirstCheckin
    Step6Next -->|뒤로가기| Step5
    
    FirstCheckin --> ChatScreen
    
    %% 에러 처리
    Step1 -.->|네트워크 오류| ErrorHandler[에러 처리]
    Step2 -.->|권한 오류| ErrorHandler
    Step3 -.->|저장 실패| ErrorHandler
    ErrorHandler --> Retry{재시도?}
    Retry -->|예| ErrorHandler
    Retry -->|아니오| AppExit
    
    style Start fill:#90EE90
    style ChatScreen fill:#87CEEB
    style AppExit fill:#FF6B9D
    style ErrorHandler fill:#FF9800
```

**주요 개선 사항**:
- ✅ 진행 상태 표시 (각 단계 번호)
- ✅ 뒤로가기 처리 명시
- ✅ 에러 처리 경로 추가
- ✅ 조건 분기 명확화

### 3.2 플로우 2: 대화형 일일 감정 체크인 (고도화 버전)

```mermaid
flowchart TD
    Start([진입점]) --> EntryPoint{진입 방식}
    EntryPoint -->|채팅 화면| ChatScreen[채팅 화면]
    EntryPoint -->|알림 클릭| NotificationClick[알림에서 진입]
    EntryPoint -->|위젯 탭| WidgetTap[위젯에서 진입]
    
    ChatScreen --> ModeCheck{현재 모드 확인}
    NotificationClick --> ModeCheck
    WidgetTap --> ModeCheck
    
    ModeCheck -->|Day Mode<br/>06:00-18:00| DayMode[Day Mode 플로우]
    ModeCheck -->|Night Mode<br/>18:00-06:00| NightMode[Night Mode 플로우]
    ModeCheck -->|수동 전환| ManualSwitch{모드 선택}
    ManualSwitch -->|Day| DayMode
    ManualSwitch -->|Night| NightMode
    
    %% Day Mode 플로우
    DayMode --> DayGreeting[AI: 오늘 기분은 어때요?]
    DayGreeting --> EmotionSelect{감정 선택 방식}
    EmotionSelect -->|칩 선택| ChipSelect[5가지 감정 칩]
    EmotionSelect -->|자유 입력| FreeInput[자연어 입력]
    ChipSelect --> EmotionChosen[감정 선택 완료]
    FreeInput --> NLPProcess{자연어 처리}
    NLPProcess -->|성공| EmotionChosen
    NLPProcess -->|실패| EmotionRetry{재입력?}
    EmotionRetry -->|예| EmotionSelect
    EmotionRetry -->|아니오| Exit[종료]
    
    EmotionChosen --> IntensitySelect[강도 선택 1-10]
    IntensitySelect --> SmartTagCheck{스마트 태그 추천}
    SmartTagCheck -->|GPS/시간대 기반| TagRecommend[태그 추천 0-3개]
    SmartTagCheck -->|수동 입력| ManualTag[수동 태그 입력]
    TagRecommend --> TagSelected{태그 선택}
    ManualTag --> TagSelected
    TagSelected -->|0-3개 선택| MemoCheck{메모 입력?}
    TagSelected -->|스킵| MemoCheck
    
    MemoCheck -->|입력| MemoInput[한 줄 메모 최대 200자]
    MemoCheck -->|스킵| SaveProcess
    MemoInput --> SaveProcess[저장 처리]
    
    SaveProcess --> Validation{입력 검증}
    Validation -->|성공| FirestoreSave[Firestore 저장]
    Validation -->|실패| ValidationError[검증 오류 표시]
    ValidationError --> SaveProcess
    
    FirestoreSave --> SaveSuccess{저장 성공?}
    SaveSuccess -->|성공| ImmediateFeedback[즉시 피드백 P95 < 800ms]
    SaveSuccess -->|실패| SaveRetry{재시도?}
    SaveRetry -->|예 최대 3회| FirestoreSave
    SaveRetry -->|아니오| SaveError[저장 실패 알림]
    SaveError --> Exit
    
    ImmediateFeedback --> AsyncInsight[AI 인사이트 생성 비동기]
    AsyncInsight --> InsightCheck{인사이트 생성 완료?}
    InsightCheck -->|8초 이내| InsightSuccess[AI 피드백 표시]
    InsightCheck -->|타임아웃 8초| InsightTimeout[폴백 메시지 + 재시도]
    InsightCheck -->|실패| InsightFail[기본 메시지 + 재시도]
    InsightTimeout --> InsightRetry{재시도?}
    InsightFail --> InsightRetry
    InsightRetry -->|예| AsyncInsight
    InsightRetry -->|아니오| InsightSuccess
    
    InsightSuccess --> ActionRecommend[마이크로 액션 추천]
    ActionRecommend --> ActionCard[오늘의 1개 액션 카드]
    ActionCard --> ActionChoice{액션 선택}
    ActionChoice -->|완료| ActionComplete[액션 완료]
    ActionChoice -->|오늘은 패스| ActionSkip[액션 스킵]
    ActionChoice -->|내일로| ActionDefer[다음날 재제안]
    
    ActionComplete --> Recheck{5초 리체크?}
    Recheck -->|예| BeforeAfter[Before/After 표시]
    Recheck -->|아니오| MicroCoach
    ActionSkip --> MicroCoach{2턴 마이크로 코치?}
    ActionDefer --> MicroCoach
    
    MicroCoach -->|더 말해보기| CoachQ1[질문 1]
    CoachQ1 --> CoachA1[답변 1]
    CoachA1 --> CoachQ2[질문 2]
    CoachQ2 --> CoachA2[답변 2]
    CoachA2 --> CoachSummary[요약 1줄 생성]
    MicroCoach -->|스킵| GrowthReflect
    CoachSummary --> GrowthReflect[성장 반영]
    BeforeAfter --> GrowthReflect
    
    GrowthReflect --> XPGain[XP 획득]
    XPGain --> LevelCheck{레벨업?}
    LevelCheck -->|예| LevelUp[레벨업 축하]
    LevelCheck -->|아니오| BlossomUpdate
    LevelUp --> BlossomUpdate[벚꽃 정원 업데이트]
    BlossomUpdate --> Complete([완료])
    
    %% Night Mode 플로우
    NightMode --> NightGreeting[AI: 오늘 하루를 정리해볼까요?]
    NightGreeting --> NightEmotionSelect[감정 선택]
    NightEmotionSelect --> NightIntensity[강도 선택]
    NightIntensity --> DaySummaryCheck{Day Mode 요약 있음?}
    DaySummaryCheck -->|예| AutoFill[Day Mode 요약 자동 인입]
    DaySummaryCheck -->|아니오| DiaryWrite
    AutoFill --> DiaryWrite[일기 작성 최대 500자]
    DiaryWrite --> NightSave[저장 처리]
    NightSave --> LetterGenerate[AI 편지 생성]
    LetterGenerate --> LetterShow[편지 표시]
    LetterShow --> UserReaction{사용자 반응}
    UserReaction -->|공감해요| NightComplete
    UserReaction -->|도움이 됐어요| NightComplete
    UserReaction -->|별로예요| FeedbackCollect[피드백 수집]
    FeedbackCollect --> NightComplete[저장 완료]
    NightComplete --> Complete
    
    %% 오프라인 처리
    FirestoreSave -.->|오프라인| OfflineMode[오프라인 모드]
    OfflineMode --> LocalSave[로컬 저장 IndexedDB]
    LocalSave --> SyncQueue[동기화 대기열]
    SyncQueue -->|온라인 복귀| AutoSync[자동 동기화]
    AutoSync --> FirestoreSave
    
    %% 위기 감지
    EmotionChosen -.->|위기 신호 감지| CrisisDetect[위기 감지]
    NightEmotionSelect -.->|위기 신호 감지| CrisisDetect
    CrisisDetect --> SafetyFlow[안전망 플로우로 전환]
    
    style Start fill:#90EE90
    style Complete fill:#87CEEB
    style Exit fill:#FF6B9D
    style CrisisDetect fill:#F44336
    style OfflineMode fill:#FF9800
```

**주요 개선 사항**:
- ✅ Day/Night Mode 분기 추가
- ✅ 감정 선택 UI 플로우 명확화
- ✅ 스마트 태그 추천 타이밍 명시
- ✅ 재시도 및 폴백 로직 상세화
- ✅ 오프라인 처리 경로 추가
- ✅ 위기 감지 인터셉트 추가

### 3.3 플로우 3: 위기 상황 대응 (고도화 버전)

```mermaid
flowchart TD
    Start([위기 감지 트리거]) --> TriggerType{감지 방식}
    TriggerType -->|키워드 감지| KeywordDetect[위기 키워드 감지]
    TriggerType -->|강도 임계값| IntensityCheck[강도 9-10 + 부정적 감정]
    TriggerType -->|사용자 요청| UserRequest[안전망 탭 클릭]
    
    KeywordDetect --> KeywordMatch{키워드 매칭?}
    KeywordMatch -->|매칭| CrisisConfirm
    KeywordMatch -->|불일치| FalsePositive{오탐 가능성}
    
    IntensityCheck --> IntensityMatch{임계값 초과?}
    IntensityMatch -->|초과| CrisisConfirm
    IntensityMatch -->|미만| NormalFlow[일반 플로우 계속]
    
    UserRequest --> CrisisConfirm[위기 신호 확인]
    FalsePositive -->|오탐| NormalFlow
    FalsePositive -->|진짜 위기| CrisisConfirm
    
    CrisisConfirm --> AutoSwitch[Safety 화면 자동 전환]
    AutoSwitch --> SafetyScreen[위기 지원 화면 표시]
    SafetyScreen --> SafetyCheck[지금 안전하신가요?]
    
    SafetyCheck -->|안전함| SafeConfirm[안전 확인]
    SafeCheck -->|도움이 필요해요| NeedHelp[도움 필요]
    
    SafeConfirm --> ReturnConfirm{일반 플로우로 복귀?}
    ReturnConfirm -->|예| ReturnOriginal[원래 화면으로 복귀]
    ReturnConfirm -->|아니오| SafetyScreen
    
    NeedHelp --> CopingTools[대처 도구 제안]
    CopingTools --> ToolSelect{도구 선택}
    ToolSelect -->|호흡 운동| Breathing[호흡 가이드 표시]
    ToolSelect -->|그라운딩| Grounding[5-4-3-2-1 가이드]
    ToolSelect -->|이완 운동| Relaxation[이완 가이드]
    ToolSelect -->|상담전화| HotlineSelect
    
    Breathing --> ToolComplete{도구 완료?}
    Grounding --> ToolComplete
    Relaxation --> ToolComplete
    ToolComplete -->|예| StabilizeCheck
    ToolComplete -->|아니오| CopingTools
    
    HotlineSelect --> HotlineChoice{상담전화 선택}
    HotlineChoice -->|1577-0199| Hotline1[정신건강 위기상담]
    HotlineChoice -->|1393| Hotline2[자살예방상담]
    HotlineChoice -->|119/112| Emergency[긴급 상황]
    HotlineChoice -->|프리미엄| ExpertConnect[전문가 연결]
    
    Hotline1 --> CallConnect[전화 연결]
    Hotline2 --> CallConnect
    Emergency --> CallConnect
    ExpertConnect --> ExpertMatch[상담사 매칭]
    ExpertMatch --> ExpertBook[예약]
    
    CallConnect --> StabilizeCheck[상황 안정화 확인]
    ExpertBook --> StabilizeCheck
    
    StabilizeCheck --> Stabilized{안정화됨?}
    Stabilized -->|예| ReturnOriginal
    Stabilized -->|아니오| ContinueHelp{계속 도움 필요?}
    ContinueHelp -->|예| CopingTools
    ContinueHelp -->|아니오| FollowUp[후속 확인 설정]
    
    FollowUp --> FollowUpSchedule[24시간 후 확인 알림]
    FollowUpSchedule --> Complete([완료])
    ReturnOriginal --> Complete
    
    %% 오프라인 처리
    SafetyScreen -.->|오프라인| OfflineTools[오프라인 대처 도구]
    OfflineTools --> OfflineBreathing[호흡 운동 번들]
    OfflineBreathing --> OfflineGrounding[그라운딩 기법 번들]
    OfflineGrounding --> OfflineRelaxation[이완 운동 번들]
    OfflineRelaxation --> OfflineHotline[응급 연락처 표시]
    OfflineHotline --> StabilizeCheck
    
    style Start fill:#F44336
    style Complete fill:#87CEEB
    style CrisisConfirm fill:#FF9800
    style OfflineTools fill:#FF9800
```

**주요 개선 사항**:
- ✅ 위기 감지 알고리즘 플로우 추가
- ✅ 오탐 처리 로직 추가
- ✅ 복귀 경로 명시
- ✅ 전문가 연결 플로우 상세화
- ✅ 오프라인 처리 추가

---

## 4. 예외 처리 및 에러 경로 상세화

### 4.1 네트워크 오류 처리 플로우

```mermaid
flowchart TD
    NetworkOperation[네트워크 작업 시도] --> NetworkCheck{네트워크 연결 확인}
    NetworkCheck -->|연결됨| OperationSuccess[작업 성공]
    NetworkCheck -->|연결 안됨| OfflineDetect[오프라인 감지]
    
    OfflineDetect --> OperationType{작업 유형}
    OperationType -->|읽기 작업| OfflineRead[로컬 캐시에서 읽기]
    OperationType -->|쓰기 작업| OfflineWrite[로컬 저장 + 동기화 대기열]
    
    OfflineRead --> CacheCheck{로컬 캐시 있음?}
    CacheCheck -->|있음| CacheShow[캐시 데이터 표시]
    CacheCheck -->|없음| NoDataMessage[데이터 없음 메시지]
    
    OfflineWrite --> QueueAdd[대기열에 추가]
    QueueAdd --> QueueNotify[동기화 대기 알림]
    QueueNotify --> NetworkMonitor[네트워크 모니터링]
    
    NetworkMonitor --> NetworkReconnect{재연결?}
    NetworkReconnect -->|예| AutoSync[자동 동기화 시작]
    NetworkReconnect -->|아니오| QueueNotify
    
    AutoSync --> SyncSuccess{동기화 성공?}
    SyncSuccess -->|성공| SyncComplete[동기화 완료 알림]
    SyncSuccess -->|실패| SyncRetry{재시도?}
    SyncRetry -->|예 최대 3회| AutoSync
    SyncRetry -->|아니오| SyncError[동기화 실패 알림]
    
    style OfflineDetect fill:#FF9800
    style AutoSync fill:#90EE90
    style SyncError fill:#F44336
```

### 4.2 AI API 실패 처리 플로우

```mermaid
flowchart TD
    AIRequest[AI API 요청] --> APICall[Gemini API 호출]
    APICall --> APICheck{API 응답 확인}
    
    APICheck -->|성공| ResponseProcess[응답 처리]
    APICheck -->|타임아웃| TimeoutHandle[타임아웃 처리]
    APICheck -->|오류| ErrorHandle[오류 처리]
    
    TimeoutHandle --> RetryCheck1{재시도 가능?}
    RetryCheck1 -->|예 < 3회| BackoffWait[지수 백오프 대기]
    BackoffWait --> APICall
    RetryCheck1 -->|아니오| Fallback1[폴백 메시지]
    
    ErrorHandle --> ErrorType{오류 유형}
    ErrorType -->|일시적 오류| RetryCheck2{재시도 가능?}
    ErrorType -->|영구적 오류| Fallback2[폴백 메시지]
    
    RetryCheck2 -->|예 < 3회| BackoffWait
    RetryCheck2 -->|아니오| Fallback2
    
    Fallback1 --> FallbackMessage[기본 응답 메시지]
    Fallback2 --> FallbackMessage
    FallbackMessage --> UserNotify[사용자에게 알림]
    UserNotify --> ManualRetry{수동 재시도?}
    ManualRetry -->|예| AIRequest
    ManualRetry -->|아니오| Continue[계속 진행]
    
    ResponseProcess --> Success[성공]
    Continue --> Success
    
    style TimeoutHandle fill:#FF9800
    style ErrorHandle fill:#F44336
    style FallbackMessage fill:#FF6B9D
```

### 4.3 데이터 검증 실패 처리 플로우

```mermaid
flowchart TD
    UserInput[사용자 입력] --> Validation[입력 검증]
    Validation --> ValidCheck{검증 통과?}
    
    ValidCheck -->|통과| SaveProcess[저장 처리]
    ValidCheck -->|실패| ErrorType{오류 유형}
    
    ErrorType -->|필수 필드 누락| RequiredError[필수 필드 오류 표시]
    ErrorType -->|형식 오류| FormatError[형식 오류 표시]
    ErrorType -->|범위 초과| RangeError[범위 초과 오류 표시]
    
    RequiredError --> ErrorMessage[오류 메시지 표시]
    FormatError --> ErrorMessage
    RangeError --> ErrorMessage
    
    ErrorMessage --> UserFix{사용자 수정}
    UserFix -->|수정| UserInput
    UserFix -->|취소| Cancel[취소]
    
    SaveProcess --> SaveSuccess{저장 성공?}
    SaveSuccess -->|성공| Success[성공]
    SaveSuccess -->|실패| SaveError[저장 오류]
    
    SaveError --> SaveRetry{재시도?}
    SaveRetry -->|예 최대 3회| SaveProcess
    SaveRetry -->|아니오| SaveFailMessage[저장 실패 메시지]
    
    Cancel --> Exit[종료]
    SaveFailMessage --> Exit
    Success --> Complete[완료]
    
    style ErrorType fill:#FF9800
    style SaveError fill:#F44336
```

---

## 5. 상태 머신 다이어그램

### 5.1 체크인 상태 머신

```mermaid
stateDiagram-v2
    [*] --> Idle: 앱 시작
    Idle --> EmotionSelecting: 체크인 시작
    EmotionSelecting --> IntensitySelecting: 감정 선택 완료
    EmotionSelecting --> EmotionSelecting: 감정 재선택
    IntensitySelecting --> TagSelecting: 강도 선택 완료
    IntensitySelecting --> IntensitySelecting: 강도 재조절
    TagSelecting --> MemoWriting: 태그 선택 완료
    TagSelecting --> Saving: 태그 스킵
    MemoWriting --> Saving: 메모 작성 완료
    MemoWriting --> Saving: 메모 스킵
    Saving --> SavingSuccess: 저장 성공
    Saving --> SavingFailed: 저장 실패
    SavingFailed --> Saving: 재시도
    SavingFailed --> EmotionSelecting: 취소
    SavingSuccess --> InsightWaiting: AI 인사이트 대기
    InsightWaiting --> InsightReceived: 인사이트 수신
    InsightWaiting --> InsightTimeout: 타임아웃
    InsightTimeout --> InsightRetry: 재시도
    InsightRetry --> InsightWaiting
    InsightReceived --> ActionShowing: 액션 카드 표시
    InsightTimeout --> ActionShowing: 폴백 메시지
    ActionShowing --> ActionCompleted: 액션 완료
    ActionShowing --> ActionSkipped: 액션 스킵
    ActionShowing --> ActionDeferred: 액션 연기
    ActionCompleted --> MicroCoach: 마이크로 코치
    ActionSkipped --> MicroCoach
    ActionDeferred --> MicroCoach
    MicroCoach --> Completed: 완료
    Completed --> [*]
```

### 5.2 온보딩 상태 머신

```mermaid
stateDiagram-v2
    [*] --> Welcome: 앱 시작
    Welcome --> PermissionRequest: 시작하기 클릭
    Welcome --> [*]: 뒤로가기 (종료)
    PermissionRequest --> InitialAssessment: 권한 완료
    PermissionRequest --> PermissionRequest: 권한 거부 (계속)
    InitialAssessment --> GoalSetting: 평가 완료
    InitialAssessment --> GoalSetting: 평가 스킵
    InitialAssessment --> PermissionRequest: 뒤로가기
    GoalSetting --> Personalization: 목표 설정 완료
    GoalSetting --> Personalization: 목표 스킵
    GoalSetting --> InitialAssessment: 뒤로가기
    Personalization --> Tutorial: 개인화 설정 완료
    Personalization --> Tutorial: 개인화 스킵
    Personalization --> GoalSetting: 뒤로가기
    Tutorial --> FirstCheckin: 튜토리얼 완료
    Tutorial --> FirstCheckin: 튜토리얼 스킵
    Tutorial --> Personalization: 뒤로가기
    FirstCheckin --> [*]: 온보딩 완료
```

### 5.3 위기 감지 상태 머신

```mermaid
stateDiagram-v2
    [*] --> Normal: 일반 상태
    Normal --> Monitoring: 감정 입력
    Monitoring --> CrisisDetected: 위기 신호 감지
    Monitoring --> Normal: 일반 감정
    CrisisDetected --> SafetyScreen: Safety 화면 전환
    SafetyScreen --> SafetyCheck: 안전 확인
    SafetyCheck --> Safe: 안전함 확인
    SafetyCheck --> NeedHelp: 도움 필요
    Safe --> Normal: 일반 플로우 복귀
    NeedHelp --> CopingTools: 대처 도구 제공
    CopingTools --> ToolCompleted: 도구 완료
    CopingTools --> HotlineCall: 상담전화 연결
    ToolCompleted --> Stabilized: 안정화 확인
    HotlineCall --> Stabilized
    Stabilized --> Normal: 안정화됨
    Stabilized --> NeedHelp: 계속 도움 필요
    NeedHelp --> FollowUp: 후속 확인 설정
    FollowUp --> Normal
```

---

## 6. 사용자 여정 맵 (User Journey Map)

### 6.1 첫 사용자 여정 (First-Time User Journey)

| 단계 | 액션 | 생각/감정 | 터치포인트 | 기회 | 통증점 |
|------|------|----------|----------|------|--------|
| **발견** | 앱 다운로드 | "감정 관리 앱이 필요해" | 앱스토어 검색 | 명확한 가치 제안 | - |
| **온보딩** | 앱 실행 | "빠르게 시작하고 싶어" | 환영 화면 | 진행 상태 표시 | 6단계가 많음 |
| **권한** | 권한 요청 | "왜 필요한지 모르겠어" | 권한 요청 화면 | 명확한 설명 | 위치 권한 거부 시 기능 제한 |
| **첫 체크인** | 감정 기록 | "어떻게 하는 거지?" | 채팅 화면 | 튜토리얼 제공 | UI 혼란 가능 |
| **AI 응답** | 인사이트 확인 | "기다리는 시간이 길어" | AI 인사이트 로딩 | 빠른 응답 | 타임아웃 시 혼란 |
| **액션** | 마이크로 액션 | "뭘 해야 할지 모르겠어" | 액션 카드 | 명확한 가이드 | 액션 선택 어려움 |

### 6.2 재방문 사용자 여정 (Returning User Journey)

| 단계 | 액션 | 생각/감정 | 터치포인트 | 기회 | 통증점 |
|------|------|----------|----------|------|--------|
| **알림** | 알림 클릭 | "오늘도 기록해야지" | 푸시 알림 | 적절한 타이밍 | 알림 차단 가능 |
| **빠른 체크인** | Day Mode 체크인 | "빨리 끝내고 싶어" | 채팅 화면 | 빠른 입력 | 단계가 많음 |
| **패턴 확인** | 리포트 확인 | "내 패턴이 궁금해" | 리포트 화면 | 인사이트 제공 | 리포트 생성 대기 |
| **성장 확인** | 벚꽃 정원 확인 | "얼마나 성장했지?" | 프로필 화면 | 시각적 피드백 | 변화가 느림 |

---

## 7. 개선 우선순위 및 실행 계획

### 7.1 P0 (즉시 수정 필요)

1. **Day/Night Mode 분기 추가** (플로우 2)
   - 작업량: 4시간
   - 담당: UX 디자이너 + 프론트엔드 개발자
   - 마감: 1주일 내

2. **예외 처리 경로 추가** (모든 플로우)
   - 작업량: 8시간
   - 담당: 프론트엔드 개발자
   - 마감: 2주일 내

3. **위기 감지 알고리즘 플로우 상세화** (플로우 3)
   - 작업량: 1일
   - 담당: 백엔드 개발자 + UX 디자이너
   - 마감: 1주일 내

### 7.2 P1 (단기 개선 필요, 1-2주)

1. **진행 상태 표시 추가** (플로우 1)
   - 작업량: 4시간
   - 담당: UX 디자이너
   - 마감: 2주일 내

2. **오프라인 처리 경로 추가** (플로우 2)
   - 작업량: 1일
   - 담당: 프론트엔드 개발자
   - 마감: 2주일 내

3. **상태 머신 다이어그램 작성** (모든 플로우)
   - 작업량: 1일
   - 담당: UX 디자이너
   - 마감: 2주일 내

### 7.3 P2 (중기 개선 필요, 1개월)

1. **사용자 여정 맵 상세화**
   - 작업량: 2일
   - 담당: UX 디자이너
   - 마감: 1개월 내

2. **성능 최적화 플로우 추가**
   - 작업량: 3일
   - 담당: 프론트엔드 개발자
   - 마감: 1개월 내

---

## 결론

### 주요 개선 사항 요약

1. **시각적 표현 개선**: Mermaid 다이어그램으로 플로우차트 시각화
2. **예외 처리 강화**: 모든 분기점에 에러 경로 추가
3. **상태 관리 명확화**: 상태 머신 다이어그램으로 상태 전환 명시
4. **Day/Night Mode 통합**: 핵심 기능인 모드 전환 플로우 추가
5. **오프라인 처리**: 네트워크 없을 때 처리 방법 명시

### 다음 단계

1. 개발팀과 디자인팀 리뷰 미팅
2. 고도화된 플로우차트를 PRD.md에 반영
3. 프로토타입 제작 시 플로우차트 참조
4. 사용자 테스트 계획 수립

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-15  
**다음 검토 예정일**: 개발 시작 전
