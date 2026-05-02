import React from 'react';
import ExpenseForm from '../components/ExpenseForm';
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Optionally redirect to dashboard after adding
    // navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">Add Expense</h1>
        <p className="text-slate-400 mt-1">Record a new transaction</p>
      </header>

      <div className="glass p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <ExpenseForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AddExpense;
