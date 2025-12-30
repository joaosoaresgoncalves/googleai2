
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedArticle, ResearchGoal } from "../types.ts";

// API key is loaded from .env.local file (not committed to git)
// This ensures the key is protected and not exposed in the code
// The key is injected by Vite via vite.config.ts from the .env.local file
const apiKey = (process.env.GEMINI_API_KEY as string) || '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY não está configurada. Por favor, crie um arquivo .env.local com sua chave da API.');
}

const ai = new GoogleGenAI({ apiKey });

const ARTICLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    importanceScore: { type: Type.NUMBER, description: "A score from 1-100 on how relevant this is to the research goal" },
    importanceReasoning: { type: Type.STRING, description: "Detailed explanation of why this article matters for the research goal" },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["title", "summary"]
      }
    }
  },
  required: ["title", "importanceScore", "importanceReasoning", "sections"]
};

// Simple ID fallback for non-secure contexts
const generateUniqueId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

export const processManualArticle = async (
  content: string, 
  researchGoal: ResearchGoal
): Promise<ProcessedArticle> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following article in the context of this research goal:
    Topic: ${researchGoal.topic}
    Description: ${researchGoal.description}
    
    Article Content:
    ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ARTICLE_SCHEMA
    }
  });

  const text = response.text || "{}";
  const data = JSON.parse(text);
  
  return {
    ...data,
    id: generateUniqueId(),
    researchGoal: researchGoal.topic,
    processedAt: Date.now(),
    sourceType: 'manual'
  };
};

export const searchAndProcessBatch = async (
  query: string,
  researchGoal: ResearchGoal
): Promise<ProcessedArticle[]> => {
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find 5 distinct and highly relevant articles about "${query}" that would specifically help with the following research:
    Goal: ${researchGoal.topic}
    Details: ${researchGoal.description}
    
    For each article, provide a full breakdown including its title, importance, and a section-by-section summary.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: ARTICLE_SCHEMA,
        description: "List of 5 processed articles"
      }
    }
  });

  const text = searchResponse.text || "[]";
  const results = JSON.parse(text);
  
  return results.map((item: any) => ({
    ...item,
    id: generateUniqueId(),
    researchGoal: researchGoal.topic,
    processedAt: Date.now(),
    sourceType: 'search'
  }));
};
