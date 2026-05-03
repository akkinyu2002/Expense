import { ListChecks, Target, TrendingDown, Wallet } from 'lucide-react';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

const SummaryStats = ({ summary, isLoading }) => {
  const { preferences } = usePreferences();
  const budgetPercent = preferences.monthlyBudget > 0
    ? Math.round(((summary?.totalAmount || 0) / preferences.monthlyBudget) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="app-surface animate-pulse rounded-lg p-5">
            <div className="mb-4 h-4 w-24 rounded bg-[var(--app-input)]"></div>
            <div className="h-8 w-32 rounded bg-[var(--app-input)]"></div>
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
      tone: 'accent',
    },
    {
      title: 'Transactions',
      value: summary?.totalExpenses || 0,
      icon: ListChecks,
      tone: 'neutral',
    },
    {
      title: 'Average Ticket',
      value: formatCurrency(summary?.averageAmount || 0, preferences),
      icon: TrendingDown,
      tone: 'success',
    },
    {
      title: 'Budget Used',
      value: `${budgetPercent}%`,
      icon: Target,
      tone: budgetPercent >= 80 ? 'warning' : 'neutral',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const toneClasses = {
          accent: 'accent-soft',
          neutral: 'bg-slate-500/10 text-slate-300',
          success: 'bg-emerald-500/10 text-emerald-300',
          warning: 'bg-amber-500/10 text-amber-300',
        }[stat.tone];

        return (
          <div key={stat.title} className="app-surface rounded-lg p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm font-medium app-muted">{stat.title}</p>
              <div className={`rounded-lg p-2 ${toneClasses}`}>
              <Icon size={24} />
              </div>
            </div>
            <h3 className="truncate text-2xl font-semibold app-text">{stat.value}</h3>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryStats;
