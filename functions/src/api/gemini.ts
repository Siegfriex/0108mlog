/**
 * Gemini API Callable Functions
 *
 * Firebase Callable Functions를 통한 Gemini API 호출
 * 모든 함수는 asia-northeast3 리전에서 실행됩니다.
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {callGeminiAPI, callGeminiAPIWithResponse, getSystemInstruction, extractGroundingLinks, sanitizeUserInput} from "../services/gemini";
import * as logger from "firebase-functions/logger";

/**
 * Day Mode 채팅 응답 생성
 */
export const generateDayModeResponse = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 90, // 인사이트가 풍부한 응답을 위한 충분한 시간
    memory: "512MiB", // AI 모델 호출에는 더 많은 메모리 필요
    maxInstances: 10,
  },
  async (request) => {
    const {userMessage, history, persona} = request.data;

    if (!userMessage || !persona) {
      throw new HttpsError("invalid-argument", "userMessage and persona are required");
    }

    try {
      const systemInstruction = getSystemInstruction(persona);
      const sanitizedMessage = sanitizeUserInput(userMessage);
      const sanitizedHistory = (history || []).slice(-10).map((h: string) => sanitizeUserInput(h));
      const prompt = `
        ${systemInstruction}

        [상황]: Day Mode (낮, 업무 시간)
        [목표]: 사용자의 감정을 빠르게 파악하고 실용적인 피드백 제공
        [제약]: 한국어로 3문장 이내로 짧게 응답.

        이전 대화 맥락:
        ${sanitizedHistory.join("\\n")}
        
        사용자: "${sanitizedMessage}"
        응답하세요.
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-flash-preview");
      return {success: true, data: response};
    } catch (error) {
      logger.error("generateDayModeResponse error:", error);
      return {
        success: false,
        error: "응답 생성 중 오류가 발생했습니다.",
        fallback: "잠시 연결이 불안정합니다.",
      };
    }
  }
);

/**
 * Night Mode 편지 생성
 */
export const generateNightModeLetter = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 60, // 편지 생성은 더 긴 응답이 필요
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    const {diaryEntry, persona} = request.data;

    if (!diaryEntry || !persona) {
      throw new HttpsError("invalid-argument", "diaryEntry and persona are required");
    }

    try {
      const systemInstruction = getSystemInstruction(persona);
      const sanitizedDiaryEntry = sanitizeUserInput(diaryEntry);
      const prompt = `
        ${systemInstruction}

        [상황]: Night Mode (밤, 성찰 시간)
        [목표]: 사용자의 일기를 읽고 하루를 정리해주는 따뜻한 편지 작성
        [형식]: 서간체 (편지 형식)

        [편지 가이드]
        1. 오프닝: 하루를 마무리하는 인사
        2. 본문: 사용자가 겪은 일과 감정에 대한 페르소나 특유의 해석
        3. 클로징: 내일을 위한 조언이나 격려

        사용자 일기: "${sanitizedDiaryEntry}"
        
        편지를 작성하세요.
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-pro-preview");
      return {success: true, data: response};
    } catch (error) {
      logger.error("generateNightModeLetter error:", error);
      return {
        success: false,
        error: "편지 생성 중 오류가 발생했습니다.",
        fallback: "지금은 편지를 쓸 수 없는 상태예요.",
      };
    }
  }
);

/**
 * 월간 회고록 생성
 */
export const generateMonthlyNarrative = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 60, // 월간 리포트 생성은 더 긴 시간 필요
    memory: "512MiB",
    maxInstances: 5,
  },
  async (request) => {
    const {summary} = request.data;

    try {
      const prompt = `
        사용자의 한 달 감정 데이터를 바탕으로 서사적인 회고록을 작성해주세요.
        데이터 요약: ${summary || "이번 달은 전반적으로 평온한 날이 많았습니다."}
        
        문체: 감성적이고 깊이 있는 에세이 스타일. 
        길이: 200자 내외.
        한국어로 작성하세요.
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-flash-preview");
      return {success: true, data: response};
    } catch (error) {
      logger.error("generateMonthlyNarrative error:", error);
      return {
        success: false,
        error: "리포트 생성 중 오류가 발생했습니다.",
        fallback: "리포트를 불러오는 중 오류가 발생했습니다.",
      };
    }
  }
);

/**
 * 큐레이션 콘텐츠 생성 (Google Search Grounding 포함)
 */
export const generateHealingContent = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 60, // Google Search Grounding 포함으로 더 긴 시간 필요
    memory: "1GiB", // Google Search Grounding에는 더 많은 메모리 필요
    maxInstances: 10,
  },
  async (request) => {
    const {emotionState, persona} = request.data;

    if (!emotionState || !persona) {
      throw new HttpsError("invalid-argument", "emotionState and persona are required");
    }

    try {
      const sanitizedEmotionState = sanitizeUserInput(emotionState);
      const prompt = `
        당신은 ${persona.name}, 사용자의 ${persona.role}입니다.
        
        [페르소나 설정]
        - MBTI: ${persona.mbti}
        - 따뜻함(Warmth): ${persona.traits.warmth}/100 
        - 직설성(Directness): ${persona.traits.directness}/100
          
        [사용자 상황]
        - 현재 기분/상태: '${sanitizedEmotionState}'
        
        [목표]
        Google Search를 사용하여 현재 사용자의 감정 상태('${sanitizedEmotionState}')와
        관련된 최신 뉴스, 예술 작품, 혹은 심리학적 발견을 찾아보세요.
        반드시 **검색된 실제 정보**를 바탕으로 페르소나의 성격에 맞는 콘텐츠를 창작해야 합니다.
        
        [콘텐츠 타입 선택 (랜덤)]
        1. poem: 검색된 자연 현상, 계절의 변화, 혹은 뉴스 속 미담을 소재로 한 시
        2. meditation: 검색된 최신 마인드풀니스 트렌드나 기법을 적용한 가이드
        3. insight: 최근 화제가 된 긍정적인 뉴스나 심리학 연구 결과를 요약하여 전달 (출처 기반)

        [출력 형식 - JSON]
        Google Search 결과를 바탕으로 작성 후, 반드시 JSON 형식만 출력하세요. 마크다운 태그 없이 raw JSON 문자열만 출력하세요.
        {
          "type": "poem" | "meditation" | "insight",
          "title": "제목 (감성적으로)",
          "body": "본문 내용 (줄바꿈은 \\n으로 표현)",
          "commentary": "이 콘텐츠를 추천하는 이유 및 참고한 검색 정보 언급 (페르소나의 말투로)",
          "tags": ["태그1", "태그2", "테마키워드"]
        }
      `;

      // Google Search Grounding을 사용하여 API 호출
      const response = await callGeminiAPIWithResponse(prompt, "gemini-3-flash-preview", {
        tools: [{googleSearch: {}}],
      });

      let text = response.text || "";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const data = JSON.parse(text);

        // Grounding 링크 추출
        const groundingLinks = extractGroundingLinks(response);

        return {
          success: true,
          data: {
            id: Date.now().toString(),
            type: data.type,
            title: data.title,
            body: data.body,
            author: persona.name,
            tags: data.tags,
            createdAt: new Date().toISOString(),
            commentary: data.commentary,
            groundingLinks: groundingLinks,
          },
        };
      } catch (parseError) {
        logger.error("JSON parsing error in generateHealingContent:", parseError);
        logger.error("Raw response text:", text);
        return {
          success: false,
          error: "콘텐츠 생성 중 오류가 발생했습니다.",
          fallback: null,
        };
      }
    } catch (error) {
      logger.error("generateHealingContent error:", error);
      return {
        success: false,
        error: "콘텐츠 생성 중 오류가 발생했습니다.",
        fallback: null,
      };
    }
  }
);

/**
 * AI 챗봇 응답 생성
 */
export const generateChatbotResponse = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 60, // Pro 모델 사용으로 더 긴 시간 필요
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    const {userMessage, history, persona} = request.data;

    if (!userMessage || !persona) {
      throw new HttpsError("invalid-argument", "userMessage and persona are required");
    }

    try {
      const systemInstruction = getSystemInstruction(persona);
      const sanitizedMessage = sanitizeUserInput(userMessage);
      const sanitizedHistory = (history || []).slice(-10).map(
        (m: { role: string; content: string }) => {
          const sanitizedContent = sanitizeUserInput(m.content);
          return `${m.role === "user" ? "사용자" : persona.name}: ${sanitizedContent}`;
        }
      );
      const prompt = `
        ${systemInstruction}

        [역할]: 당신은 사용자의 질문에 답하고, 고민을 들어주고, 자유롭게 대화하는 AI 어시스턴트입니다.
        [목표]: 도움이 되고, 통찰력 있으며, 페르소나에 맞는 대화를 제공하세요.
        
        대화 기록:
        ${sanitizedHistory.join("\\n")}
        
        사용자: "${sanitizedMessage}"
        응답:
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-pro-preview");
      return {success: true, data: response};
    } catch (error) {
      logger.error("generateChatbotResponse error:", error);
      return {
        success: false,
        error: "응답 생성 중 오류가 발생했습니다.",
        fallback: "연결에 문제가 발생했습니다.",
      };
    }
  }
);

/**
 * 마이크로 액션 생성
 */
export const generateMicroAction = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30, // 빠른 응답이지만 여유 있게 설정
    memory: "512MiB",
    maxInstances: 10,
  },
  async (request) => {
    const {emotion, intensity, userContext} = request.data;

    if (!emotion || intensity === undefined) {
      throw new HttpsError("invalid-argument", "emotion and intensity are required");
    }

    try {
      const sanitizedUserContext = sanitizeUserInput(userContext || "");
      const prompt = `
        사용자의 현재 감정: ${emotion} (강도: ${intensity}/10)
        최근 대화 요약: "${sanitizedUserContext}"

        위 상황에 처한 사용자에게 즉시 도움이 되는 '마이크로 액션(Micro Action)'을 하나 추천해주세요.
        
        조건:
        1. 5분 이내에 실행 가능한 구체적인 행동이어야 합니다.
        2. 감정 강도가 높을수록 신체적인 이완(호흡, 스트레칭)을, 낮을수록 인지적인 환기(기록, 감사하기)를 추천하세요.
        
        [출력 형식 - JSON]
        반드시 JSON 형식만 출력하세요.
        {
          "title": "행동 제목 (예: 478 호흡법)",
          "description": "구체적인 지시 사항 (1~2문장)",
          "duration": "예상 소요 시간 (예: 3 min)",
          "type": "breathing" | "journaling" | "exercise" | "mindfulness"
        }
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-flash-preview");

      const text = response.replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const data = JSON.parse(text);

        return {
          success: true,
          data: {
            id: Date.now().toString(),
            title: data.title,
            description: data.description,
            duration: data.duration,
            type: data.type,
          },
        };
      } catch (parseError) {
        logger.error("JSON parsing error in generateMicroAction:", parseError);
        logger.error("Raw response text:", text);
        // Fallback action
        return {
          success: false,
          error: "액션 생성 중 오류가 발생했습니다.",
          fallback: {
            id: "fallback",
            title: "심호흡 하기",
            description: "편안한 자세로 눈을 감고 3번 깊게 숨을 들이마시고 내쉬세요.",
            duration: "1 min",
            type: "breathing",
          },
        };
      }
    } catch (error) {
      logger.error("generateMicroAction error:", error);
      // Fallback action
      return {
        success: false,
        error: "액션 생성 중 오류가 발생했습니다.",
        fallback: {
          id: "fallback",
          title: "심호흡 하기",
          description: "편안한 자세로 눈을 감고 3번 깊게 숨을 들이마시고 내쉬세요.",
          duration: "1 min",
          type: "breathing",
        },
      };
    }
  }
);

/**
 * 타임라인 분석
 */
export const generateTimelineAnalysis = onCall(
  {
    region: "asia-northeast3",
    timeoutSeconds: 30, // 타임라인 분석에는 적절한 시간 필요
    memory: "512MiB",
    maxInstances: 5,
  },
  async (request) => {
    const {entries} = request.data;

    if (!entries || !Array.isArray(entries)) {
      throw new HttpsError("invalid-argument", "entries array is required");
    }

    try {
      const summaries = entries.slice(0, 10).map((e: {
        date: Date | string;
        emotion: string;
        intensity?: number;
        summary?: string;
      }) =>
        `- ${new Date(e.date).toLocaleDateString()}: ${e.emotion} (Intensity ${e.intensity || "N/A"}) - ${sanitizeUserInput(e.summary || "")}`
      ).join("\n");

      const prompt = `
        You are an empathetic AI therapist assistant.
        Analyze the following timeline of emotional entries from a user.
        Identify any recurring patterns, emotional shifts, or triggers.
        
        Provide a brief, supportive insight (max 2-3 sentences) in Korean.
        Focus on growth, resilience, or gentle observation.
        
        User Entries:
        ${summaries}
      `;

      const response = await callGeminiAPI(prompt, "gemini-3-flash-preview");
      return {success: true, data: response};
    } catch (error) {
      logger.error("generateTimelineAnalysis error:", error);
      return {
        success: false,
        error: "분석 중 오류가 발생했습니다.",
        fallback: "분석 중 오류가 발생했습니다.",
      };
    }
  }
);
