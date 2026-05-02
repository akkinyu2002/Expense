import React, { useState, useEffect } from 'react';
import ExpenseList from '../components/ExpenseList';
import Charts from '../components/Charts';
import SummaryStats from '../components/SummaryStats';
import InsightsPanel from '../components/InsightsPanel';
import { expenseService } from '../services/api';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

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
      </header>

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
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg"
          >
            Refresh Data
          </button>
        </div>
        <ExpenseList limit={5} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;
