
import React, { useState, useEffect, useCallback } from 'react';
import { ResearchGoal, ProcessedArticle, ProcessingStatus } from './types';
import { processManualArticle, searchAndProcessBatch } from './services/geminiService';
import { ArticleCard } from './components/ArticleCard';

const App: React.FC = () => {
  const [researchGoal, setResearchGoal] = useState<ResearchGoal>({
    topic: '',
    description: ''
  });
  const [manualContent, setManualContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<ProcessedArticle[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [activeTab, setActiveTab] = useState<'manual' | 'search'>('manual');

  // Load from local storage
  useEffect(() => {
    const savedArticles = localStorage.getItem('research_articles');
    const savedGoal = localStorage.getItem('research_goal');
    if (savedArticles) setArticles(JSON.parse(savedArticles));
    if (savedGoal) setResearchGoal(JSON.parse(savedGoal));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('research_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('research_goal', JSON.stringify(researchGoal));
  }, [researchGoal]);

  const handleManualProcess = async () => {
    if (!manualContent.trim() || !researchGoal.topic) return;
    setStatus(ProcessingStatus.PROCESSING);
    try {
      const result = await processManualArticle(manualContent, researchGoal);
      setArticles(prev => [result, ...prev]);
      setManualContent('');
      setStatus(ProcessingStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleBatchSearch = async () => {
    if (!searchQuery.trim() || !researchGoal.topic) return;
    setStatus(ProcessingStatus.SEARCHING);
    try {
      const results = await searchAndProcessBatch(searchQuery, researchGoal);
      setArticles(prev => [...results, ...prev]);
      setSearchQuery('');
      setStatus(ProcessingStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">ResearchFlow AI</h1>
              <p className="text-xs text-slate-400 font-medium">Intelligent Article Synthesis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-white/5 text-sm">
              <span className="text-slate-500 mr-2">Stored Articles:</span>
              <span className="text-indigo-400 font-bold">{articles.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Context & Input */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Research Goal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Primary Topic</label>
                <input 
                  type="text"
                  placeholder="e.g., Quantum Computing Ethics"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white"
                  value={researchGoal.topic}
                  onChange={(e) => setResearchGoal({...researchGoal, topic: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Context / Description</label>
                <textarea 
                  placeholder="What are you trying to discover? The agent uses this to weigh article importance."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 text-white text-sm"
                  value={researchGoal.description}
                  onChange={(e) => setResearchGoal({...researchGoal, description: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-6 overflow-hidden">
            <div className="flex border-b border-white/5 mb-6">
              <button 
                onClick={() => setActiveTab('manual')}
                className={`flex-1 pb-3 text-sm font-bold transition-all ${activeTab === 'manual' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
              >
                Manual Entry
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={`flex-1 pb-3 text-sm font-bold transition-all ${activeTab === 'search' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}
              >
                Batch Search (5)
              </button>
            </div>

            {activeTab === 'manual' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Article Content</label>
                  <textarea 
                    placeholder="Paste article text or URL content here..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-64 text-sm font-mono text-slate-300"
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleManualProcess}
                  disabled={status !== ProcessingStatus.IDLE || !manualContent || !researchGoal.topic}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
                >
                  {status === ProcessingStatus.PROCESSING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Process Article
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
                  <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                    The Research Agent will perform a web search, select the top 5 most relevant articles, and generate comprehensive reports for each automatically.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Search Query</label>
                  <input 
                    type="text"
                    placeholder="Search for recent research..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleBatchSearch}
                  disabled={status !== ProcessingStatus.IDLE || !searchQuery || !researchGoal.topic}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
                >
                  {status === ProcessingStatus.SEARCHING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Agent Researching (5x)...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      Execute Batch Search
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        </aside>

        {/* Main Content: List of articles */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Research Library</h2>
            <div className="flex gap-2">
               <button 
                 onClick={() => { if(confirm('Clear all research?')) setArticles([]); }}
                 className="px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-950/30 rounded transition-all"
               >
                 Clear Library
               </button>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="glass rounded-2xl h-96 flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/5">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-400">Your library is empty</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Set a research goal and input an article or perform a batch search to start building your synthesis library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {articles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onDelete={deleteArticle} 
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Status Notification */}
      {status === ProcessingStatus.ERROR && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          An error occurred. Please check your API key or connection.
          <button onClick={() => setStatus(ProcessingStatus.IDLE)} className="ml-2 hover:opacity-70">✕</button>
        </div>
      )}
    </div>
  );
};

export default App;
