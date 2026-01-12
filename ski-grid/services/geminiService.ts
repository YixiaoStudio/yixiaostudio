
import { GoogleGenAI } from "@google/genai";
import { SKI_PROMPTS } from "../constants";

export async function generateSkiImage(
  base64Data: string, 
  mimeType: string, 
  promptIndex: number
): Promise<string> {
  // 密钥必须且仅能从 process.env.API_KEY 获取
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('未检测到有效的 API Key。请在部署环境中确保已设置 API_KEY 环境变量。');
  }

  // 使用 gemini-2.5-flash-image 模型，它支持直接使用注入的密钥而无需强制用户手动选择
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
            text: `High-end professional ski vacation photography. Transform the person in this photo into a professional skier in this scene. Ensure their face remains clear and recognizable: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
          // Note: imageSize is only supported for gemini-3-pro-image-preview
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      throw new Error('AI 服务响应异常，请尝试更换照片。');
    }

    // 遍历所有 Part 以寻找生成的图像
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error('生成的响应中未包含图像数据。');
  } catch (error: any) {
    console.error(`Gemini API 错误 [${modelName}]:`, error);
    
    let message = error.message || '生成失败';
    
    if (message.includes('403') || message.includes('API_KEY_INVALID')) {
      throw new Error('API Key 无效。请检查部署环境中的密钥配置。');
    }

    throw new Error(`AI 生成异常: ${message}`);
  }
}
