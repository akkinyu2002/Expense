import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/api';
import { Lightbulb, TrendingUp, TrendingDown, Info, AlertCircle, Sparkles } from 'lucide-react';

const InsightIcon = ({ type }) => {
  switch (type) {
    case 'success': return <TrendingDown className="text-emerald-400" size={20} />;
    case 'warning': return <AlertCircle className="text-amber-400" size={20} />;
    case 'stat': return <TrendingUp className="text-blue-400" size={20} />;
    default: return <Info className="text-slate-400" size={20} />;
  }
};

const InsightsPanel = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const data = await expenseService.getInsights();
        setInsights(data.data);
      } catch (err) {
        console.error('Failed to load insights', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6">
        <Sparkles size={32} className="mb-4 opacity-20" />
        <p>No insights generated yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="text-amber-400" size={24} />
        <h2 className="text-xl font-bold text-slate-100">AI Insights</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const bgColors = {
            success: 'bg-emerald-500/10 border-emerald-500/20',
            warning: 'bg-amber-500/10 border-amber-500/20',
            stat: 'bg-blue-500/10 border-blue-500/20',
            info: 'bg-slate-800/50 border-slate-700/50'
          };

          const textColors = {
            success: 'text-emerald-400',
            warning: 'text-amber-400',
            stat: 'text-blue-400',
            info: 'text-slate-300'
          };

          return (
            <div 
              key={index} 
              className={`p-4 rounded-xl border ${bgColors[insight.type || 'info']} flex items-start gap-4 transition-all hover:-translate-y-1`}
            >
              <div className={`p-2 rounded-lg bg-slate-900/50 shadow-inner mt-1 shrink-0`}>
                <InsightIcon type={insight.type} />
              </div>
              <div>
                <h4 className={`font-semibold text-sm mb-1 ${textColors[insight.type || 'info']}`}>
                  {insight.title}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
