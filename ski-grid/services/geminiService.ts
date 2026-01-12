
import { GoogleGenAI } from "@google/genai";
import { SKI_PROMPTS } from "../constants";

export async function generateSkiImage(
  base64Data: string, 
  mimeType: string, 
  promptIndex: number
): Promise<string> {
  // 按照规范：始终从 process.env.API_KEY 获取
  // 提示：在 GitHub Pages 环境下，如果 build 阶段没有正确替换，这里可能是 undefined 或占位符
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_KEY');
  }

  // 每次调用都重新实例化，确保使用最新的 Key（处理用户中途通过 aistudio 对话框更换 Key 的情况）
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const modelName = 'gemini-2.5-flash-image';
  const prompt = SKI_PROMPTS[promptIndex];

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `High-end professional ski vacation photography. Transform the person in this photo into a professional skier in this specific mountain scene: ${prompt}. Ensure face is clear.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      throw new Error('AI_RESPONSE_EMPTY');
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error('NO_IMAGE_DATA');
  } catch (error: any) {
    const errorMsg = error.message || '';
    console.error(`Gemini API Error [${modelName}]:`, error);
    
    // 如果返回 400 API_KEY_INVALID，抛出特定错误代码供前端识别
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('400')) {
      throw new Error('INVALID_KEY');
    }
    
    throw new Error(errorMsg || '生成过程中发生未知错误');
  }
}
