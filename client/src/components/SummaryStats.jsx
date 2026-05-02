import { Wallet, TrendingDown, Target } from 'lucide-react';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

const SummaryStats = ({ summary, isLoading }) => {
  const { preferences } = usePreferences();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-6 rounded-2xl animate-pulse bg-slate-800/50">
            <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
            <div className="h-8 w-32 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Spent',
      value: formatCurrency(summary?.totalAmount || 0, preferences),
      icon: Wallet,
      color: 'blue'
    },
    {
      title: 'Average Daily',
      value: formatCurrency(summary?.averageAmount || 0, preferences),
      icon: TrendingDown,
      color: 'emerald'
    },
    {
      title: 'Top Category',
      value: summary?.topCategory || 'N/A',
      icon: Target,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'text-blue-400 bg-blue-500/10',
          emerald: 'text-emerald-400 bg-emerald-500/10',
          purple: 'text-purple-400 bg-purple-500/10'
        }[stat.color];

        return (
          <div key={i} className="glass p-6 rounded-2xl flex items-center gap-5 border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className={`p-4 rounded-2xl ${colorClasses}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-100">{stat.value}</h3>
            </div>
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity ${colorClasses.split(' ')[0].replace('text-', 'bg-')}`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryStats;
