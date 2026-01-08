/**
 * Firebase Functions 인덱스
 *
 * 모든 Callable Functions를 export합니다.
 */

import {setGlobalOptions} from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

// Global options
setGlobalOptions({
  region: "asia-northeast3",
  maxInstances: 10,
});

// Gemini API Functions
export {
  generateDayModeResponse,
  generateNightModeLetter,
  generateMonthlyNarrative,
  generateHealingContent,
  generateChatbotResponse,
  generateMicroAction,
  generateTimelineAnalysis,
} from "./api/gemini";

logger.info("Firebase Functions initialized");
