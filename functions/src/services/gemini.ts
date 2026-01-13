/**
 * Gemini API 서비스 레이어
 *
 * Gemini API 클라이언트 초기화 및 호출 헬퍼 함수
 */

import {GoogleGenAI} from "@google/genai";
import {getGeminiApiKey} from "../config/secrets";
import retry from "async-retry";
import {logInfo, logError, logPerformance, LogContext} from "../utils/logger";

const geminiServiceContext: LogContext = {
  functionName: "GeminiService",
};

let geminiClient: GoogleGenAI | null = null;

/**
 * Gemini 클라이언트를 초기화합니다.
 *
 * @returns {Promise<GoogleGenAI>} 초기화된 Gemini 클라이언트
 */
export async function initializeGeminiClient(): Promise<GoogleGenAI> {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = await getGeminiApiKey();
  geminiClient = new GoogleGenAI({apiKey});
  return geminiClient;
}

/**
 * 사용자 입력을 안전하게 이스케이프
 * 프롬프트 인젝션 공격 방어
 *
 * @param input 사용자 입력 문자열
 * @returns {string} 이스케이프된 안전한 문자열
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // JSON 이스케이프 문자 제거 및 길이 제한
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .substring(0, 10000); // 최대 길이 제한
}

/**
 * 페르소나 기반 시스템 인스트럭션 생성
 *
 * @param persona 페르소나 설정
 * @returns {string} 시스템 인스트럭션 문자열
 */
export function getSystemInstruction(persona: {
  name: string;
  role: string;
  mbti: string;
  traits: { warmth: number; directness: number };
}): string {
  const warmthDesc = persona.traits.warmth > 50 ?
    "매우 따뜻하고 감정적으로 공감하는 태도" :
    "냉철하고 이성적이며 논리적인 태도";

  const directnessDesc = persona.traits.directness > 50 ?
    "돌려 말하지 않고 핵심을 직설적으로 전달하는 화법" :
    "부드럽고 완곡하게 돌려 말하는 화법";

  return `
    당신의 이름은 '${persona.name}'이며, 사용자의 '${persona.role}'입니다.
    MBTI 성격 유형은 '${persona.mbti}'입니다.
    
    다음과 같은 성격 특성을 반드시 유지하며 대화하세요:
    1. ${warmthDesc}를 유지하세요. (설정값: ${persona.traits.warmth}/100)
    2. ${directnessDesc}을 사용하세요. (설정값: ${persona.traits.directness}/100)
    3. 사용자의 감정을 존중하되, 설정된 페르소나에 맞춰 일관성 있게 반응하세요.
  `;
}

/**
 * Gemini API 호출 옵션
 */
interface GeminiAPIOptions {
  tools?: Array<{ googleSearch: Record<string, never> }>;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Gemini API 에러 타입
 */
export enum GeminiErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * 에러 타입 분류
 *
 * @param error 에러 객체
 * @returns {GeminiErrorType} 분류된 에러 타입
 */
export function classifyGeminiError(
  error: Error | {code?: string | number; message?: string}
): GeminiErrorType {
  const errorWithCode = error as {code?: string | number; message?: string};
  if (errorWithCode.code === "ECONNREFUSED" || errorWithCode.code === "ETIMEDOUT" ||
      errorWithCode.message?.includes("network")) {
    return GeminiErrorType.NETWORK_ERROR;
  }
  if (errorWithCode.code === 429 || errorWithCode.message?.includes("rate limit")) {
    return GeminiErrorType.RATE_LIMIT_ERROR;
  }
  if (errorWithCode.code === 401 || errorWithCode.code === 403) {
    return GeminiErrorType.AUTH_ERROR;
  }
  if (errorWithCode.code === "functions/deadline-exceeded" ||
      errorWithCode.message?.includes("timeout")) {
    return GeminiErrorType.TIMEOUT_ERROR;
  }
  if (typeof errorWithCode.code === "number" && errorWithCode.code >= 400 &&
      errorWithCode.code < 500) {
    return GeminiErrorType.API_ERROR;
  }
  return GeminiErrorType.UNKNOWN_ERROR;
}

/**
 * Gemini API 호출 헬퍼 함수 (재시도 로직 포함)
 *
 * @param prompt 프롬프트 문자열
 * @param model 사용할 모델 ('gemini-3-flash-preview' | 'gemini-3-pro-preview')
 * @param options 추가 옵션 (tools, temperature, maxTokens)
 * @returns {Promise<string>} 생성된 응답 텍스트
 * @throws {Error} API 호출 실패 시
 */
export async function callGeminiAPI(
  prompt: string,
  model: "gemini-3-flash-preview" | "gemini-3-pro-preview" = "gemini-3-flash-preview",
  options?: GeminiAPIOptions
): Promise<string> {
  const apiStartTime = Date.now();

  return await retry(
    async () => {
      const initStartTime = Date.now();
      const client = await initializeGeminiClient();
      const initDuration = Date.now() - initStartTime;

      // 클라이언트 초기화 시간 로깅
      logPerformance(geminiServiceContext, "client_init", initDuration, {
        cached: initDuration < 10, // 10ms 이하면 캐시 히트로 간주
      });

      // tools 옵션이 있으면 config로 변환
      const requestOptions: {
        model: string;
        contents: string;
        config?: { tools: Array<{ googleSearch: Record<string, never> }> };
        temperature?: number;
        maxTokens?: number;
      } = {
        model,
        contents: prompt,
      };

      if (options?.tools) {
        requestOptions.config = {
          tools: options.tools,
        };
      }

      if (options?.temperature !== undefined) {
        requestOptions.temperature = options.temperature;
      }

      if (options?.maxTokens !== undefined) {
        requestOptions.maxTokens = options.maxTokens;
      }

      const callStartTime = Date.now();
      const response = await client.models.generateContent(requestOptions);
      const callDuration = Date.now() - callStartTime;

      // API 호출 시간 로깅
      logPerformance(geminiServiceContext, "gemini_api_call", callDuration, {
        model,
        promptLength: prompt.length,
        responseLength: response.text?.length || 0,
      });

      return response.text || "";
    },
    {
      retries: 1,
      minTimeout: 1000, // 1초
      maxTimeout: 5000, // 5초
      factor: 2, // 지수 백오프
      randomize: true, // 지터 추가
      onRetry: (error: Error, attempt: number) => {
        const errorType = classifyGeminiError(error);
        logInfo(geminiServiceContext, `Gemini API retry attempt ${attempt}`, {
          errorType,
          errorMessage: error.message,
          attempt,
        });
      },
    }
  ).catch((error: Error) => {
    const totalDuration = Date.now() - apiStartTime;
    const errorType = classifyGeminiError(error);
    logError(geminiServiceContext, error, {
      errorType,
      model,
      totalDurationMs: totalDuration,
    });
    throw error;
  });
}

/**
 * Gemini API 호출 헬퍼 함수 (전체 응답 객체 반환, 재시도 로직 포함)
 * Google Search Grounding 등 metadata가 필요한 경우 사용
 *
 * @param prompt 프롬프트 문자열
 * @param model 사용할 모델 ('gemini-3-flash-preview' | 'gemini-3-pro-preview')
 * @param options 추가 옵션 (tools, temperature, maxTokens)
 * @returns {Promise<any>} 전체 응답 객체
 * @throws {Error} API 호출 실패 시
 */
export async function callGeminiAPIWithResponse(
  prompt: string,
  model: "gemini-3-flash-preview" | "gemini-3-pro-preview" = "gemini-3-flash-preview",
  options?: GeminiAPIOptions
): Promise<{
  text?: string;
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {title?: string; uri?: string};
      }>;
    };
  }>;
}> {
  const apiStartTime = Date.now();

  return await retry(
    async () => {
      const initStartTime = Date.now();
      const client = await initializeGeminiClient();
      const initDuration = Date.now() - initStartTime;

      logPerformance(geminiServiceContext, "client_init", initDuration, {
        cached: initDuration < 10,
      });

      // tools 옵션이 있으면 config로 변환
      const requestOptions: {
        model: string;
        contents: string;
        config?: {tools: Array<{googleSearch: Record<string, never>}>};
        temperature?: number;
        maxTokens?: number;
      } = {
        model,
        contents: prompt,
      };

      if (options?.tools) {
        requestOptions.config = {
          tools: options.tools,
        };
      }

      if (options?.temperature !== undefined) {
        requestOptions.temperature = options.temperature;
      }

      if (options?.maxTokens !== undefined) {
        requestOptions.maxTokens = options.maxTokens;
      }

      const callStartTime = Date.now();
      const response = await client.models.generateContent(requestOptions);
      const callDuration = Date.now() - callStartTime;

      logPerformance(geminiServiceContext, "gemini_api_call_with_response", callDuration, {
        model,
        promptLength: prompt.length,
        hasGrounding: !!options?.tools,
      });

      return response as {
        text?: string;
        candidates?: Array<{
          groundingMetadata?: {
            groundingChunks?: Array<{
              web?: {title?: string; uri?: string};
            }>;
          };
        }>;
      };
    },
    {
      retries: 1,
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2,
      randomize: true,
      onRetry: (error: Error, attempt: number) => {
        const errorType = classifyGeminiError(error);
        logInfo(geminiServiceContext, `Gemini API retry attempt ${attempt}`, {
          errorType,
          errorMessage: error.message,
          attempt,
        });
      },
    }
  ).catch((error: Error) => {
    const totalDuration = Date.now() - apiStartTime;
    const errorType = classifyGeminiError(error);
    logError(geminiServiceContext, error, {
      errorType,
      model,
      totalDurationMs: totalDuration,
    });
    throw error;
  });
}

/**
 * Gemini API 응답에서 Grounding Metadata 추출
 *
 * @param response Gemini API 응답 객체
 * @returns {Array<{title: string; url: string}>} Grounding 링크 배열
 */
export function extractGroundingLinks(response: {
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {title?: string; uri?: string};
      }>;
    };
  }>;
}): Array<{title: string; url: string}> {
  const groundingLinks: {title: string; url: string}[] = [];

  if (response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0]?.groundingMetadata?.groundingChunks) {
    response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: {
      web?: {title?: string; uri?: string};
    }) => {
      if (chunk.web && chunk.web.uri) {
        groundingLinks.push({
          title: chunk.web.title || "Related Source",
          url: chunk.web.uri,
        });
      }
    });
  }

  return groundingLinks;
}
