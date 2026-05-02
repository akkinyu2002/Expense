import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/api';
import { Trash2, ShoppingBag, Coffee, Car, FileText, Film, CircleDollarSign } from 'lucide-react';

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
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses(limit ? { limit } : {});
      setExpenses(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [limit, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-slate-500 text-center py-12 flex flex-col items-center">
        <CircleDollarSign size={48} className="mb-4 opacity-20" />
        <p>No expenses found. Start adding some!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
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
              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
            >
              <td className="py-4 px-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <CategoryIcon category={expense.category} />
                </div>
              </td>
              <td className="py-4 px-4 font-medium text-slate-200">
                {expense.description || <span className="text-slate-500 italic">No description</span>}
              </td>
              <td className="py-4 px-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                  {expense.category}
                </span>
              </td>
              <td className="py-4 px-4 text-slate-400 text-sm">
                {new Date(expense.date).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 text-right font-medium text-slate-200">
                Rs. {expense.amount.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right">
                <button 
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
