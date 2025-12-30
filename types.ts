
export interface Section {
  title: string;
  summary: string;
}

export interface ProcessedArticle {
  id: string;
  title: string;
  url?: string;
  content?: string;
  importanceScore: number;
  importanceReasoning: string;
  sections: Section[];
  researchGoal: string;
  processedAt: number;
  sourceType: 'manual' | 'search';
}

export interface ResearchGoal {
  topic: string;
  description: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SEARCHING = 'SEARCHING',
  ERROR = 'ERROR'
}
