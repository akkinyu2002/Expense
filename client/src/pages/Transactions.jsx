import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Download,
  Pencil,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { expenseService } from '../services/api';
import usePreferences from '../hooks/usePreferences';
import { categories, formatCurrency } from '../services/preferences';

const getMonthStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const Transactions = () => {
  const { preferences } = usePreferences();
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: getMonthStart(),
    endDate: getToday(),
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const queryFilters = useMemo(() => ({
    category: filters.category,
    startDate: filters.startDate,
    endDate: filters.endDate,
  }), [filters.category, filters.endDate, filters.startDate]);

  useEffect(() => {
    let isMounted = true;

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const response = await expenseService.getExpenses(queryFilters);
        if (!isMounted) return;
        setExpenses(response.data || []);
        setError(null);
      } catch {
        if (!isMounted) return;
        setError('Could not load transactions.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchExpenses();

    return () => {
      isMounted = false;
    };
  }, [queryFilters, refreshTrigger]);

  const filteredExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) {
      return expenses;
    }

    return expenses.filter((expense) => (
      expense.description?.toLowerCase().includes(search)
      || expense.category?.toLowerCase().includes(search)
      || String(expense.amount).includes(search)
      || expense.date?.includes(search)
    ));
  }, [expenses, filters.search]);

  const summary = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const categoryTotals = filteredExpenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount || 0);
      return totals;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    return {
      totalAmount,
      count: filteredExpenses.length,
      average: filteredExpenses.length ? totalAmount / filteredExpenses.length : 0,
      topCategory,
    };
  }, [filteredExpenses]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (preset) => {
    const today = new Date();
    const endDate = getToday();

    if (preset === 'month') {
      setFilters((current) => ({
        ...current,
        startDate: getMonthStart(),
        endDate,
      }));
      return;
    }

    if (preset === 'last30') {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      setFilters((current) => ({
        ...current,
        startDate: start.toISOString().split('T')[0],
        endDate,
      }));
      return;
    }

    setFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const exportCsv = () => {
    const header = ['Date', 'Description', 'Category', 'Amount'];
    const rows = filteredExpenses.map((expense) => [
      expense.date,
      expense.description || '',
      expense.category,
      expense.amount,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'expenseai-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Transactions exported');
  };

  const startEdit = (expense) => {
    setStatus('');
    setEditingId(expense.id);
    setEditDraft({
      amount: String(expense.amount || ''),
      description: expense.description || '',
      category: expense.category || 'Other',
      date: expense.date || getToday(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    setError(null);

    try {
      const response = await expenseService.updateExpense(id, editDraft);
      setExpenses((current) => current.map((expense) => (
        expense.id === id ? response.data : expense
      )));
      cancelEdit();
      setStatus('Transaction updated');
    } catch {
      setError('Could not update transaction.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await expenseService.deleteExpense(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      setStatus('Transaction deleted');
    } catch {
      setError('Could not delete transaction.');
    }
  };

  const summaryCards = [
    { label: 'Filtered spend', value: formatCurrency(summary.totalAmount, preferences) },
    { label: 'Transactions', value: summary.count },
    { label: 'Average ticket', value: formatCurrency(summary.average, preferences) },
    { label: 'Top category', value: summary.topCategory },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg accent-soft accent-ring px-3 py-1 text-sm font-medium">
            <CalendarDays size={15} />
            Transaction ledger
          </p>
          <h1 className="text-3xl font-bold app-text">Transactions</h1>
          <p className="mt-1 app-muted">Review, correct, filter, and export recorded spending.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRefreshTrigger((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="app-surface rounded-lg p-4">
            <p className="text-sm font-medium app-muted">{card.label}</p>
            <p className="mt-2 truncate text-2xl font-semibold app-text">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="app-surface rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 app-muted" size={17} />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              className="app-field w-full rounded-lg py-[var(--control-y)] pl-10 pr-3"
              placeholder="Search description, category, amount"
            />
          </label>

          <label>
            <span className="sr-only">Category</span>
            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Start date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            />
          </label>

          <label>
            <span className="sr-only">End date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter('endDate', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            />
          </label>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredExpenses.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-[var(--control-y)] font-medium transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => applyPreset('month')} className="rounded-lg accent-soft px-3 py-1.5 text-sm font-medium">
            This month
          </button>
          <button type="button" onClick={() => applyPreset('last30')} className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-medium app-muted hover:text-[var(--app-text)]">
            Last 30 days
          </button>
          <button type="button" onClick={() => applyPreset('clear')} className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-medium app-muted hover:text-[var(--app-text)]">
            Clear
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {status}
        </div>
      ) : null}

      <section className="app-surface overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-lg bg-[var(--app-input)]" />
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-10 text-center app-muted">
            No transactions match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[var(--app-border)] bg-[var(--app-input)] app-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const isEditing = editingId === expense.id;

                  return (
                    <tr key={expense.id} className="border-b border-[var(--app-border)] last:border-b-0">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDraft.date}
                            onChange={(event) => setEditDraft((current) => ({ ...current, date: event.target.value }))}
                            className="app-field w-full rounded-lg px-3 py-2"
                          />
                        ) : (
                          <span className="app-muted">{formatDate(expense.date)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.description}
                            onChange={(event) => setEditDraft((current) => ({ ...current, description: event.target.value }))}
                            className="app-field w-full rounded-lg px-3 py-2"
                            placeholder="Description"
                          />
                        ) : (
                          <span className="font-medium app-text">{expense.description || 'No description'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editDraft.category}
                            onChange={(event) => setEditDraft((current) => ({ ...current, category: event.target.value }))}
                            className="app-field w-full rounded-lg px-3 py-2"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs font-medium app-muted">
                            {expense.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold app-text">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editDraft.amount}
                            onChange={(event) => setEditDraft((current) => ({ ...current, amount: event.target.value }))}
                            className="app-field ml-auto w-32 rounded-lg px-3 py-2 text-right"
                          />
                        ) : (
                          formatCurrency(expense.amount, preferences)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(expense.id)}
                                disabled={savingId === expense.id}
                                className="rounded-lg bg-[var(--accent)] p-2 text-white transition hover:brightness-110 disabled:opacity-50"
                                aria-label="Save transaction"
                                title="Save transaction"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg border border-[var(--app-border)] p-2 app-muted transition hover:text-[var(--app-text)]"
                                aria-label="Cancel edit"
                                title="Cancel edit"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(expense)}
                                className="rounded-lg border border-[var(--app-border)] p-2 app-muted transition hover:text-[var(--app-text)]"
                                aria-label="Edit transaction"
                                title="Edit transaction"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteExpense(expense.id)}
                                className="rounded-lg border border-red-500/25 p-2 text-red-300 transition hover:bg-red-500/10"
                                aria-label="Delete transaction"
                                title="Delete transaction"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Transactions;
