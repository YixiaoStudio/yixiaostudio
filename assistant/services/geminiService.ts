
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

// Helper to get AI client using direct environment variable as per guidelines
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAssistantResponse = async (history: { role: string, parts: { text: string }[] }[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });
  return response.text;
};
