
import React from 'react';
import { ProcessedArticle } from '../types';
import { generateArticlePDF } from '../services/pdfService';

interface ArticleCardProps {
  article: ProcessedArticle;
  onDelete: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onDelete }) => {
  return (
    <div className="glass rounded-xl p-6 transition-all hover:scale-[1.01] group border-l-4 border-indigo-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">
            {article.sourceType === 'search' ? 'Web Research' : 'Manual Entry'}
          </span>
          <h3 className="text-xl font-bold mt-2 leading-tight">{article.title}</h3>
          <p className="text-sm text-slate-400 mt-1">Processed: {new Date(article.processedAt).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => onDelete(article.id)}
          className="text-slate-500 hover:text-red-400 p-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: `${article.importanceScore}%` }}
            />
          </div>
          <span className="text-sm font-bold text-indigo-400">{article.importanceScore}% Relevant</span>
        </div>
        <p className="text-slate-300 text-sm line-clamp-3">{article.importanceReasoning}</p>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-xs font-bold uppercase text-slate-500">Key Sections</h4>
        {article.sections.slice(0, 3).map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
            <span className="text-xs text-slate-400 font-medium">{s.title}</span>
          </div>
        ))}
        {article.sections.length > 3 && (
          <p className="text-xs text-slate-500 italic">...and {article.sections.length - 3} more sections</p>
        )}
      </div>

      <button
        onClick={() => generateArticlePDF(article)}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
        Export PDF Report
      </button>
    </div>
  );
};
