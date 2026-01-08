import { GoogleGenAI } from "@google/genai";
import { CoachPersona, ContentData, ContentType, MicroAction, EmotionType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (persona: CoachPersona) => {
  const warmthDesc = persona.traits.warmth > 50 
    ? "매우 따뜻하고 감정적으로 공감하는 태도" 
    : "냉철하고 이성적이며 논리적인 태도";
  
  const directnessDesc = persona.traits.directness > 50 
    ? "돌려 말하지 않고 핵심을 직설적으로 전달하는 화법" 
    : "부드럽고 완곡하게 돌려 말하는 화법";

  return `
    당신의 이름은 '${persona.name}'이며, 사용자의 '${persona.role}'입니다.
    MBTI 성격 유형은 '${persona.mbti}'입니다.
    
    다음과 같은 성격 특성을 반드시 유지하며 대화하세요:
    1. ${warmthDesc}를 유지하세요. (설정값: ${persona.traits.warmth}/100)
    2. ${directnessDesc}을 사용하세요. (설정값: ${persona.traits.directness}/100)
    3. 사용자의 감정을 존중하되, 설정된 페르소나에 맞춰 일관성 있게 반응하세요.
  `;
};

export const generateDayModeResponse = async (
  userMessage: string,
  history: string[],
  persona: CoachPersona
): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not configured.";

  const systemInstruction = getSystemInstruction(persona);

  const prompt = `
    ${systemInstruction}

    [상황]: Day Mode (낮, 업무 시간)
    [목표]: 사용자의 감정을 빠르게 파악하고 실용적인 피드백 제공
    [제약]: 한국어로 3문장 이내로 짧게 응답.

    이전 대화 맥락:
    ${history.join('\n')}
    
    사용자: "${userMessage}"
    응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "잠시 연결이 불안정합니다.";
  }
};

export const generateNightModeLetter = async (
  diaryEntry: string,
  persona: CoachPersona
): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not configured.";

  const systemInstruction = getSystemInstruction(persona);

  const prompt = `
    ${systemInstruction}

    [상황]: Night Mode (밤, 성찰 시간)
    [목표]: 사용자의 일기를 읽고 하루를 정리해주는 따뜻한 편지 작성
    [형식]: 서간체 (편지 형식)

    [편지 가이드]
    1. 오프닝: 하루를 마무리하는 인사
    2. 본문: 사용자가 겪은 일과 감정에 대한 페르소나 특유의 해석
    3. 클로징: 내일을 위한 조언이나 격려

    사용자 일기: "${diaryEntry}"
    
    편지를 작성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "편지를 작성하는 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "지금은 편지를 쓸 수 없는 상태예요.";
  }
};

export const generateMonthlyNarrative = async (): Promise<string> => {
  if (!process.env.API_KEY) return "리포트를 생성할 수 없습니다.";
  // Monthly report is less persona-dependent, more analytical, keeping existing logic mostly
  const mockSummary = "이번 달은 전반적으로 '평온'한 날이 많았지만, 15일경 업무로 인한 '불안'이 높았습니다. 하지만 주말마다 충분한 휴식을 통해 '기쁨'을 되찾는 패턴을 보였습니다.";

  const prompt = `
    사용자의 한 달 감정 데이터를 바탕으로 서사적인 회고록을 작성해주세요.
    데이터 요약: ${mockSummary}
    
    문체: 감성적이고 깊이 있는 에세이 스타일. 
    길이: 200자 내외.
    한국어로 작성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "리포트 생성 실패";
  } catch (error) {
    console.error(error);
    return "리포트를 불러오는 중 오류가 발생했습니다.";
  }
};

export const generateHealingContent = async (
  emotionState: string,
  persona: CoachPersona
): Promise<ContentData | null> => {
  if (!process.env.API_KEY) return null;

  // Derive tone from traits
  const warmthTone = persona.traits.warmth > 60 
    ? "감성적이고, 부드럽고, 위로가 되는 문체" 
    : persona.traits.warmth < 40 
      ? "분석적이고, 객관적이고, 차분한 문체" 
      : "적당히 따뜻하면서 균형 잡힌 문체";

  const directnessTone = persona.traits.directness > 60
    ? "짧고, 강렬하고, 핵심을 찌르는 표현"
    : "은유적이고, 서사적이고, 부드러운 흐름";

  const prompt = `
    당신은 ${persona.name}, 사용자의 ${persona.role}입니다.
    MBTI: ${persona.mbti}.
    현재 사용자의 기분/상태: '${emotionState}'
    
    [목표]
    사용자의 기분과 관련된 최신 정보나, 과학적 사실, 혹은 위로가 되는 실제 이야기를 Google Search로 찾아서 이를 바탕으로 콘텐츠를 창작하세요.
    검색된 정보를 활용하여 사실에 기반하거나(Insight), 깊이 있는 은유(Poem)를 제공하세요.
    
    [톤앤매너 설정]
    1. ${warmthTone}를 사용하세요.
    2. ${directnessTone}을 사용하세요.
    3. 구체적인 검색 결과(최신 뉴스, 심리학 연구, 트렌드)를 참고하여 내용을 풍성하게 만드세요.

    [콘텐츠 타입 선택 (랜덤)]
    1. poem: 짧은 시 (3연 이내, 검색된 자연 현상이나 뉴스에서 영감을 얻음)
    2. meditation: 짧은 마음챙김 가이드 (검색된 최신 스트레스 해소 기법 참고, 200자 내외)
    3. insight: 감정과 관련된 심리학적 사실이나 마음을 울리는 최신 미담 (뉴스/아티클 요약)

    [출력 형식 - JSON]
    Google Search 결과를 바탕으로 작성 후, 반드시 JSON 형식만 출력하세요. 마크다운 태그 없이 raw JSON 문자열만 출력하세요.
    {
      "type": "poem" | "meditation" | "insight",
      "title": "제목 (감성적으로)",
      "body": "본문 내용 (줄바꿈은 \\n으로 표현)",
      "commentary": "이 콘텐츠를 추천하는 이유 (페르소나의 말투로 1문장)",
      "tags": ["태그1", "태그2", "테마키워드"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Enable Google Search Grounding
      }
    });
    
    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);

    // Extract Grounding Metadata
    const groundingLinks: { title: string; url: string }[] = [];
    if (response.candidates && response.candidates[0].groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          groundingLinks.push({
            title: chunk.web.title || "Related Source",
            url: chunk.web.uri
          });
        }
      });
    }
    
    return {
      id: Date.now().toString(),
      type: data.type,
      title: data.title,
      body: data.body,
      author: persona.name,
      tags: data.tags,
      createdAt: new Date(),
      commentary: data.commentary,
      groundingLinks: groundingLinks
    } as ContentData & { commentary?: string };

  } catch (error) {
    console.error("Content Generation Error:", error);
    return null;
  }
};

export const generateChatbotResponse = async (
  userMessage: string,
  history: { role: string; content: string }[],
  persona: CoachPersona
): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not configured.";

  const systemInstruction = getSystemInstruction(persona);

  const prompt = `
    ${systemInstruction}

    [역할]: 당신은 사용자의 질문에 답하고, 고민을 들어주고, 자유롭게 대화하는 AI 어시스턴트입니다.
    [목표]: 도움이 되고, 통찰력 있으며, 페르소나에 맞는 대화를 제공하세요.
    
    대화 기록:
    ${history.map(m => `${m.role === 'user' ? '사용자' : persona.name}: ${m.content}`).join('\n')}
    
    사용자: "${userMessage}"
    응답:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "응답을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return "연결에 문제가 발생했습니다.";
  }
};

export const generateMicroAction = async (
  emotion: EmotionType,
  intensity: number,
  userContext: string
): Promise<MicroAction | null> => {
  if (!process.env.API_KEY) return null;

  const prompt = `
    사용자의 현재 감정: ${emotion} (강도: ${intensity}/10)
    최근 대화 요약: "${userContext}"

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);
    
    return {
      id: Date.now().toString(),
      ...data
    };
  } catch (error) {
    console.error("Micro Action Generation Error:", error);
    // Fallback action
    return {
      id: "fallback",
      title: "심호흡 하기",
      description: "편안한 자세로 눈을 감고 3번 깊게 숨을 들이마시고 내쉬세요.",
      duration: "1 min",
      type: "breathing"
    };
  }
};