import { useEffect, useState } from 'react';
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
          <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--app-input)]"></div>
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 app-muted">
        <Sparkles size={32} className="mb-4 opacity-20" />
        <p>No insights generated yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-5">
      <div className="mb-5 flex items-center gap-2">
        <Lightbulb className="text-amber-400" size={24} />
        <h2 className="text-lg font-semibold app-text">Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const bgColors = {
            success: 'bg-emerald-500/10 border-emerald-500/20',
            warning: 'bg-amber-500/10 border-amber-500/20',
            stat: 'bg-blue-500/10 border-blue-500/20',
            info: 'bg-[var(--app-input)] border-[var(--app-border)]'
          };

          const textColors = {
            success: 'text-emerald-400',
            warning: 'text-amber-400',
            stat: 'text-blue-400',
            info: 'app-text'
          };

          return (
            <div 
              key={index} 
              className={`flex items-start gap-3 rounded-lg border p-4 ${bgColors[insight.type || 'info']}`}
            >
              <div className="mt-1 shrink-0 rounded-lg bg-[var(--app-panel-strong)] p-2">
                <InsightIcon type={insight.type} />
              </div>
              <div>
                <h4 className={`font-semibold text-sm mb-1 ${textColors[insight.type || 'info']}`}>
                  {insight.title}
                </h4>
                <p className="text-sm leading-relaxed app-muted">
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
