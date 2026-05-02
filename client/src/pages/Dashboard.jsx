import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PlusCircle, RefreshCw } from 'lucide-react';
import ExpenseList from '../components/ExpenseList';
import Charts from '../components/Charts';
import SummaryStats from '../components/SummaryStats';
import InsightsPanel from '../components/InsightsPanel';
import { expenseService } from '../services/api';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

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

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await expenseService.getSummary();
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's your financial overview.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 glass rounded-2xl h-[400px] flex flex-col relative overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-slate-100">Category Breakdown</h2>
          </div>
          <Charts summary={summary} />
        </div>

        {/* Insights */}
        <div className="glass rounded-2xl h-[400px] relative overflow-hidden">
          <InsightsPanel refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <div className="glass p-6 rounded-2xl min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Recent Expenses</h2>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="inline-flex items-center gap-2 text-sm transition-colors accent-soft px-3 py-1.5 rounded-lg hover:brightness-110"
          >
            <RefreshCw size={15} />
            Refresh Data
          </button>
        </div>
        <ExpenseList limit={5} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;
