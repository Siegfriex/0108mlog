/**
 * Mobile UX E2E Screen Capture Manifest (Production)
 *
 * - 목적: "탭/플로우/스크린" 단위로 캡처 대상을 선언적으로 정의
 * - 실행: run-mobile-audit.mjs가 본 manifest를 읽어 순차 실행/캡처
 *
 * 주의:
 * - 가능한 한 텍스트 셀렉터 대신 role/aria-label/고정 selector 사용
 * - 실제 UI 변경 시: 여기(스크린 정의)만 업데이트하면 러너는 재사용 가능
 */
export const MOBILE_AUDIT_MANIFEST_V1 = {
  version: "1.0",
  viewport: { width: 390, height: 844 }, // iPhone 14 Pro 기준
  /**
   * 그룹 단위로 "초기 상태(스토리지/모드)"를 분리합니다.
   * - onboarding: 온보딩 플로우 캡처 전용 (onboarding_completed 미설정)
   * - main: 온보딩 스킵 + 동의 모달 스킵 + day mode 강제
   */
  groups: [
    {
      id: "onboarding",
      tab: "onboarding",
      description: "온보딩 6단계 캡처 (환영→권한→초기평가→목표→개인화→튜토리얼)",
      storagePreset: {
        onboardingCompleted: false,
        modeOverride: "day",
        consentPreset: "revoked", // 동의 모달은 온보딩에서는 크게 상관 없지만, 예외적으로 뜨는 경우 방지
      },
      screens: [
        {
          id: "onboarding_welcome",
          name: "웰컴",
          path: "/onboarding",
          file: "01-welcome.png",
          waitFor: [
            { type: "selector", selector: '[data-testid="progress-indicator"]' },
            { type: "role", role: "button", name: "대화 시작하기" },
          ],
        },
        {
          id: "onboarding_permissions",
          name: "권한 설정",
          path: "/onboarding",
          steps: [{ type: "click", by: "role", role: "button", name: "대화 시작하기" }],
          file: "02-permissions.png",
          waitFor: [{ type: "role", role: "heading", name: "권한 설정" }],
        },
        {
          id: "onboarding_assessment_q1",
          name: "초기 평가 (Q1)",
          path: "/onboarding",
          steps: [
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
          ],
          file: "03-assessment-q1.png",
          waitFor: [{ type: "role", role: "heading", name: "초기 평가" }],
        },
        {
          id: "onboarding_goals",
          name: "목표 설정",
          path: "/onboarding",
          steps: [
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 }, // 권한 단계 다음
            // 초기평가: Q1 선택 → Q2 선택 → 다음 → Q3 선택 → 다음
            { type: "click", by: "text", text: "보통" },
            { type: "wait", ms: 450 },
            { type: "click", by: "text", text: "감정 패턴 이해" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "text", text: "감정을 더 잘 이해하고 싶어요" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
          ],
          file: "04-goals.png",
          waitFor: [{ type: "role", role: "heading", name: "목표 설정" }],
        },
        {
          id: "onboarding_personalization",
          name: "개인화 설정",
          path: "/onboarding",
          steps: [
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "text", text: "보통" },
            { type: "wait", ms: 450 },
            { type: "click", by: "text", text: "감정 패턴 이해" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "text", text: "감정을 더 잘 이해하고 싶어요" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 }, // goals 단계 next (기본 선택 있음)
          ],
          file: "05-personalization.png",
          waitFor: [{ type: "role", role: "heading", name: "개인화 설정" }],
        },
        {
          id: "onboarding_tutorial",
          name: "튜토리얼 가이드",
          path: "/onboarding",
          steps: [
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "text", text: "보통" },
            { type: "wait", ms: 450 },
            { type: "click", by: "text", text: "감정 패턴 이해" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "text", text: "감정을 더 잘 이해하고 싶어요" },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 },
            { type: "click", by: "role", role: "button", name: "다음", index: 0 }, // personalization 단계 next
          ],
          file: "06-tutorial.png",
          waitFor: [{ type: "role", role: "heading", name: "첫 체크인 가이드" }],
        },
      ],
    },
    {
      id: "main",
      tab: "main",
      description: "메인 탭(채팅/기록/통계/콘텐츠/프로필/안전망) 캡처",
      storagePreset: {
        onboardingCompleted: true,
        modeOverride: "day",
        consentPreset: "revoked",
      },
      screens: [
        // ---- Chat ----
        {
          id: "chat_emotion_modal",
          tab: "chat",
          name: "감정 선택 모달",
          path: "/chat",
          file: "01-emotion-modal.png",
          waitFor: [{ type: "role", role: "heading", name: "오늘 기분이 어떠신가요?" }],
        },
        {
          id: "chat_intensity",
          tab: "chat",
          name: "강도 슬라이더 노출",
          path: "/chat",
          steps: [{ type: "click", by: "role", role: "button", name: "괜찮아요 감정 선택" }],
          file: "02-intensity.png",
          waitFor: [{ type: "selector", selector: '[data-testid="intensity-slider"]' }],
          metricsTargets: [
            { label: "intensity_slider", selector: '[data-testid="intensity-slider"]' },
            { label: "start_chat_btn", role: "button", name: "대화 시작하기" },
          ],
        },
        {
          id: "chat_started",
          tab: "chat",
          name: "채팅 시작(인사 메시지)",
          path: "/chat",
          steps: [
            { type: "click", by: "role", role: "button", name: "괜찮아요 감정 선택" },
            { type: "setRange", selector: '[data-testid="intensity-slider"]', value: 7 },
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
          ],
          file: "03-chat-initial.png",
          waitFor: [{ type: "selector", selector: '[data-testid="day-mode"]' }],
        },
        {
          id: "chat_user_sent",
          tab: "chat",
          name: "사용자 메시지 전송 직후(로딩/생각중 상태)",
          path: "/chat",
          steps: [
            { type: "click", by: "role", role: "button", name: "괜찮아요 감정 선택" },
            { type: "setRange", selector: '[data-testid="intensity-slider"]', value: 7 },
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "wait", ms: 350 },
            { type: "fill", by: "aria", name: "메시지 입력", text: "오늘 날씨가 좋아서 기분이 좋아요" },
            { type: "click", by: "aria", name: "전송" },
          ],
          file: "04-user-message.png",
          waitFor: [
            { type: "selector", selector: '[data-testid="day-mode"]' },
            { type: "selector", selector: '[data-testid="user-message"]' },
          ],
        },
        {
          id: "chat_ai_response",
          tab: "chat",
          name: "AI 응답(또는 타임아웃 시 현재 상태)",
          path: "/chat",
          steps: [
            { type: "click", by: "role", role: "button", name: "괜찮아요 감정 선택" },
            { type: "wait", ms: 350 },
            { type: "setRange", selector: '[data-testid="intensity-slider"]', value: 7 },
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "wait", ms: 350 },
            { type: "fill", by: "aria", name: "메시지 입력", text: "오늘 날씨가 좋아서 기분이 좋아요" },
            { type: "click", by: "aria", name: "전송" },
          ],
          file: "05-ai-response.png",
          strictWaits: false,
          waitFor: [
            { type: "selector", selector: '[data-testid="day-mode"]' },
            { type: "selector", selector: '[data-testid="ai-message"]', timeoutMs: 30000 },
          ],
        },
        {
          id: "chat_quick_chips",
          tab: "chat",
          name: "Quick Chips 노출(또는 타임아웃 시 현재 상태)",
          path: "/chat",
          steps: [
            { type: "click", by: "role", role: "button", name: "괜찮아요 감정 선택" },
            { type: "setRange", selector: '[data-testid="intensity-slider"]', value: 7 },
            { type: "click", by: "role", role: "button", name: "대화 시작하기" },
            { type: "wait", ms: 350 },
            { type: "fill", by: "aria", name: "메시지 입력", text: "오늘 하루는 어땠어요?" },
            { type: "click", by: "aria", name: "전송" },
          ],
          file: "06-quick-chips.png",
          strictWaits: false,
          waitFor: [
            { type: "selector", selector: '[data-testid="day-mode"]' },
            { type: "selector", selector: '[data-testid="quick-chip"]', timeoutMs: 30000 },
          ],
        },
        // ---- Journal ----
        {
          id: "journal_main",
          tab: "journal",
          name: "기록 메인(타임라인)",
          path: "/journal",
          file: "01-journal-main.png",
          waitFor: [{ type: "selector", selector: '[data-testid="timeline"]' }],
        },
        {
          id: "journal_search",
          tab: "journal",
          name: "기록 검색",
          path: "/journal/search",
          file: "02-journal-search.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "journal_diary",
          tab: "journal",
          name: "일기",
          path: "/journal/diary",
          file: "03-journal-diary.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "journal_journey",
          tab: "journal",
          name: "여정 시각화",
          path: "/journal/journey",
          file: "04-journal-journey.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        // ---- Reports ----
        {
          id: "reports_weekly",
          tab: "reports",
          name: "주간 리포트",
          path: "/reports/weekly",
          file: "01-weekly.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "reports_monthly",
          tab: "reports",
          name: "월간 리포트",
          path: "/reports/monthly",
          file: "02-monthly.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "reports_monthly_retro",
          tab: "reports",
          name: "월간 회고록",
          path: "/reports/monthly-retrospective",
          file: "03-monthly-retrospective.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "reports_monitor",
          tab: "reports",
          name: "실시간 모니터",
          path: "/reports/monitor",
          file: "04-monitor.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        // ---- Content ----
        {
          id: "content_main",
          tab: "content",
          name: "콘텐츠 메인",
          path: "/content",
          file: "01-content-main.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "content_poems",
          tab: "content",
          name: "시/문학",
          path: "/content/poems",
          file: "02-poems.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "content_meditations",
          tab: "content",
          name: "명상",
          path: "/content/meditations",
          file: "03-meditations.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "content_music",
          tab: "content",
          name: "힐링 음악",
          path: "/content/music",
          file: "04-music.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "content_immersion",
          tab: "content",
          name: "몰입",
          path: "/content/immersion",
          file: "05-immersion.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        // ---- Profile ----
        {
          id: "profile_main",
          tab: "profile",
          name: "프로필 메인",
          path: "/profile",
          file: "01-profile.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_settings",
          tab: "profile",
          name: "설정",
          path: "/profile/settings",
          file: "02-settings.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_persona",
          tab: "profile",
          name: "페르소나 설정",
          path: "/profile/persona",
          file: "03-persona.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_daynight",
          tab: "profile",
          name: "Day/Night 설정",
          path: "/profile/daynight",
          file: "04-daynight.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_privacy",
          tab: "profile",
          name: "개인정보",
          path: "/profile/privacy",
          file: "05-privacy.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_privacy_policy",
          tab: "profile",
          name: "개인정보 처리방침",
          path: "/profile/privacy/policy",
          file: "06-privacy-policy.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "profile_conversations",
          tab: "profile",
          name: "대화 관리",
          path: "/profile/conversations",
          file: "07-conversations.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        // ---- Safety ----
        {
          id: "safety_main",
          tab: "safety",
          name: "안전망 메인",
          path: "/safety",
          file: "01-safety.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "safety_crisis",
          tab: "safety",
          name: "위기 지원",
          path: "/safety/crisis",
          file: "02-crisis.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
        {
          id: "safety_tools",
          tab: "safety",
          name: "대처 도구",
          path: "/safety/tools",
          file: "03-tools.png",
          waitFor: [{ type: "selector", selector: "#main-content" }],
        },
      ],
    },
  ],
};

