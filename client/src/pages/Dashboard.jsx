import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CalendarDays, PlusCircle, RefreshCw } from 'lucide-react';
import ExpenseList from '../components/ExpenseList';
import Charts from '../components/Charts';
import SummaryStats from '../components/SummaryStats';
import InsightsPanel from '../components/InsightsPanel';
import { expenseService } from '../services/api';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

const getMonthStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

const Dashboard = () => {
  const { preferences } = usePreferences();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const budgetPercent = preferences.monthlyBudget > 0
    ? Math.round(((summary?.totalAmount || 0) / preferences.monthlyBudget) * 100)
    : 0;
  const shouldShowBudgetAlert = preferences.budgetAlerts
    && preferences.monthlyBudget > 0
    && budgetPercent >= 80;
  const remainingBudget = Math.max(0, preferences.monthlyBudget - (summary?.totalAmount || 0));
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - today.getDate() + 1);
  const dailyPace = remainingBudget / daysLeft;
  const categoryRows = Object.entries(summary?.categoryBreakdown || {})
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 4);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await expenseService.getSummary({
          startDate: getMonthStart(),
          endDate: getToday(),
        });
        setSummary(data.data);
      } catch (err) {
        console.error('Failed to load summary', err);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg accent-soft accent-ring px-3 py-1 text-sm font-medium">
            <CalendarDays size={15} />
            This month
          </p>
          <h1 className="text-3xl font-bold app-text">Finance overview</h1>
          <p className="mt-1 app-muted">A concise operating view of spend, budget, and category exposure.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-2 text-sm font-medium app-text transition hover:border-[var(--accent)]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <PlusCircle size={16} />
            Add expense
          </Link>
        </div>
      </header>

      {shouldShowBudgetAlert ? (
        <div className="app-surface rounded-lg p-4 flex flex-col gap-3 border-amber-400/30 bg-amber-500/10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-300">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-semibold text-amber-200">Budget watch</p>
              <p className="text-sm text-amber-100/80">
                {formatCurrency(summary?.totalAmount || 0, preferences)} spent of {formatCurrency(preferences.monthlyBudget, preferences)}.
              </p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-950/40 md:w-48">
            <div
              className="h-full rounded-full bg-amber-300"
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
        </div>
      ) : null}

      <SummaryStats summary={summary} isLoading={isLoadingSummary} />

      <section className="app-surface rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium app-muted">Monthly budget position</p>
            <p className="mt-1 text-2xl font-semibold app-text">
              {formatCurrency(remainingBudget, preferences)} remaining
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 md:text-right">
            <div>
              <p className="app-muted">Target</p>
              <p className="font-semibold app-text">{formatCurrency(preferences.monthlyBudget, preferences)}</p>
            </div>
            <div>
              <p className="app-muted">Daily pace left</p>
              <p className="font-semibold app-text">{formatCurrency(dailyPace, preferences)}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--app-input)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="app-surface flex h-[400px] flex-col overflow-hidden rounded-lg lg:col-span-2">
          <div className="flex items-center justify-between gap-3 p-5 pb-0">
            <h2 className="text-lg font-semibold app-text">Category breakdown</h2>
            <Link to="/transactions" className="inline-flex items-center gap-1 text-sm font-medium app-muted hover:text-[var(--app-text)]">
              Ledger
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <Charts summary={summary} />
        </section>

        <section className="app-surface h-[400px] overflow-hidden rounded-lg">
          <InsightsPanel refreshTrigger={refreshTrigger} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="app-surface min-h-[300px] rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold app-text">Recent expenses</h2>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-medium app-muted transition hover:text-[var(--app-text)]"
            >
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <ExpenseList limit={6} refreshTrigger={refreshTrigger} />
        </section>

        <section className="app-surface h-fit rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold app-text">Category exposure</h2>
            <span className="text-sm app-muted">{summary?.topCategory || 'None'}</span>
          </div>

          <div className="space-y-4">
            {categoryRows.length === 0 ? (
              <p className="py-6 text-center text-sm app-muted">No category activity yet.</p>
            ) : categoryRows.map(([category, value]) => {
              const share = summary?.totalAmount
                ? Math.round((value.total / summary.totalAmount) * 100)
                : 0;

              return (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium app-text">{category}</span>
                    <span className="app-muted">{formatCurrency(value.total, preferences)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--app-input)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs app-muted">{share}% of monthly spend</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
