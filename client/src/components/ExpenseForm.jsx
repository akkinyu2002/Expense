import React, { useState } from 'react';
import { expenseService } from '../services/api';
import { PlusCircle, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';

const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoiceTranscription = (transcript) => {
    // Basic parser for "spent X on Y" or just extracting numbers
    let amount = formData.amount;
    let description = transcript;
    
    // Look for numbers in the transcript
    const numberMatch = transcript.match(/\d+(\.\d+)?/);
    if (numberMatch) {
      amount = numberMatch[0];
      // Try to clean up the description by removing "spent X on"
      description = transcript
        .replace(new RegExp(`spent\\s+${amount}\\s+on\\s+`, 'i'), '')
        .replace(new RegExp(`${amount}\\s+on\\s+`, 'i'), '')
        .trim();
        
      // Capitalize first letter
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    setFormData(prev => ({
      ...prev,
      amount: amount || prev.amount,
      description: description
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Send the data, if category is empty string, we let the backend auto-categorize it.
      const payload = {
        ...formData,
        category: formData.category || undefined
      };
      
      const result = await expenseService.createExpense(payload);
      
      setSuccess(true);
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      if (onSuccess) onSuccess(result.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative z-20 space-y-6">
      <div className="pb-6 border-b border-slate-700/50 flex flex-col items-center justify-center">
        <VoiceInput onTranscription={handleVoiceTranscription} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm">
          Expense added successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Amount (Rs.) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">Rs.</span>
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          placeholder="e.g., Pizza with friends"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Category (Optional)</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
          >
            <option value="">Auto-categorize (AI)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <PlusCircle size={20} />
            <span>Add Expense</span>
          </>
        )}
      </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
