import { useEffect, useState } from 'react';
import { expenseService } from '../services/api';
import { Trash2, ShoppingBag, Coffee, Car, FileText, Film, CircleDollarSign } from 'lucide-react';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'Food': return <Coffee className="text-orange-400" size={20} />;
    case 'Transport': return <Car className="text-blue-400" size={20} />;
    case 'Bills': return <FileText className="text-red-400" size={20} />;
    case 'Shopping': return <ShoppingBag className="text-purple-400" size={20} />;
    case 'Entertainment': return <Film className="text-pink-400" size={20} />;
    default: return <CircleDollarSign className="text-emerald-400" size={20} />;
  }
};

const ExpenseList = ({ limit, refreshTrigger }) => {
  const { preferences } = usePreferences();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const data = await expenseService.getExpenses(limit ? { limit } : {});
        if (!isMounted) return;
        setExpenses(data.data);
        setError(null);
      } catch {
        if (!isMounted) return;
        setError('Failed to load expenses');
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
  }, [limit, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch {
      alert('Failed to delete expense');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--app-input)]"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-300">{error}</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center app-muted">
        <CircleDollarSign size={48} className="mb-4 opacity-20" />
        <p>No expenses found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--app-border)] text-sm app-muted">
            <th className="py-4 px-4 font-medium w-12"></th>
            <th className="py-4 px-4 font-medium">Description</th>
            <th className="py-4 px-4 font-medium">Category</th>
            <th className="py-4 px-4 font-medium">Date</th>
            <th className="py-4 px-4 font-medium text-right">Amount</th>
            <th className="py-4 px-4 font-medium w-12"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr 
              key={expense.id} 
              className="group border-b border-[var(--app-border)] transition-colors hover:bg-[var(--app-input)]"
            >
              <td className="py-4 px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-input)]">
                  <CategoryIcon category={expense.category} />
                </div>
              </td>
              <td className="py-4 px-4 font-medium app-text">
                {expense.description || <span className="app-muted">No description</span>}
              </td>
              <td className="py-4 px-4">
                <span className="rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs font-medium app-muted">
                  {expense.category}
                </span>
              </td>
              <td className="py-4 px-4 text-sm app-muted">
                {new Date(expense.date).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 text-right font-medium app-text">
                {formatCurrency(expense.amount, preferences)}
              </td>
              <td className="py-4 px-4 text-right">
                <button 
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Delete expense"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
