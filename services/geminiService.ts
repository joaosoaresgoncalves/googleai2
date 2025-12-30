
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedArticle, Section, ResearchGoal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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

  const data = JSON.parse(response.text);
  
  return {
    ...data,
    id: crypto.randomUUID(),
    researchGoal: researchGoal.topic,
    processedAt: Date.now(),
    sourceType: 'manual'
  };
};

export const searchAndProcessBatch = async (
  query: string,
  researchGoal: ResearchGoal
): Promise<ProcessedArticle[]> => {
  // First, find relevant content using Search Grounding
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

  const results = JSON.parse(searchResponse.text);
  
  return results.map((item: any) => ({
    ...item,
    id: crypto.randomUUID(),
    researchGoal: researchGoal.topic,
    processedAt: Date.now(),
    sourceType: 'search'
  }));
};
