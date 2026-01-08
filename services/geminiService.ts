import { GoogleGenAI } from "@google/genai";
import { CoachPersona, ContentData, ContentType, MicroAction, EmotionType, TimelineEntry } from "../types";

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

  const prompt = `
    당신은 ${persona.name}, 사용자의 ${persona.role}입니다.
    
    [페르소나 설정]
    - MBTI: ${persona.mbti}
    - 따뜻함(Warmth): ${persona.traits.warmth}/100 
      (높을수록 감성적/공감적, 낮을수록 이성적/분석적)
    - 직설성(Directness): ${persona.traits.directness}/100
      (높을수록 핵심만 전달, 낮을수록 은유적/서사적 표현)
      
    [사용자 상황]
    - 현재 기분/상태: '${emotionState}'
    
    [목표]
    Google Search를 사용하여 현재 사용자의 감정 상태('${emotionState}')와 관련된 최신 뉴스, 예술 작품, 혹은 심리학적 발견을 찾아보세요.
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
      "commentary": "이 콘텐츠를 추천하는 이유 및 참고한 검색 정보 언급 (페르소나의 말투로, 예: '${persona.name}' 스타일)",
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

export const generateTimelineAnalysis = async (entries: TimelineEntry[]): Promise<string> => {
  if (!process.env.API_KEY) return "Analysis unavailable.";
  
  // Summarize entries for the model
  const summaries = entries.slice(0, 10).map(e => 
    `- ${e.date.toLocaleDateString()}: ${e.emotion} (Intensity ${e.intensity || 'N/A'}) - ${e.summary}`
  ).join('\n');

  const prompt = `
    You are an empathetic AI therapist assistant.
    Analyze the following timeline of emotional entries from a user.
    Identify any recurring patterns, emotional shifts, or triggers.
    
    Provide a brief, supportive insight (max 2-3 sentences) in Korean.
    Focus on growth, resilience, or gentle observation.
    
    User Entries:
    ${summaries}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "패턴을 분석할 수 없습니다.";
  } catch (error) {
    console.error("Timeline Analysis Error:", error);
    return "분석 중 오류가 발생했습니다.";
  }
};
