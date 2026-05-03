import { useEffect, useState } from 'react';
import { expenseService } from '../services/api';
import { PlusCircle, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';
import usePreferences from '../hooks/usePreferences';
import { categories, getCurrencySymbol } from '../services/preferences';

const DRAFT_STORAGE_KEY = 'expenseai.expense-form-draft.v1';

const today = () => new Date().toISOString().split('T')[0];

const createEmptyFormData = (preferences) => ({
  amount: '',
  description: '',
  category: preferences.autoCategorize ? '' : preferences.defaultCategory,
  date: today(),
});

const loadFormData = (preferences) => {
  if (!preferences.saveDrafts) {
    return createEmptyFormData(preferences);
  }

  try {
    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return stored ? { ...createEmptyFormData(preferences), ...JSON.parse(stored) } : createEmptyFormData(preferences);
  } catch {
    return createEmptyFormData(preferences);
  }
};

const ExpenseForm = ({ onSuccess }) => {
  const { preferences } = usePreferences();
  const [formData, setFormData] = useState(() => loadFormData(preferences));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const currencySymbol = getCurrencySymbol(preferences);

  useEffect(() => {
    if (!preferences.saveDrafts) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData, preferences.saveDrafts]);

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
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData(createEmptyFormData(preferences));
      
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
      <div className="flex flex-col items-center justify-center border-b border-[var(--app-border)] pb-6">
        <VoiceInput
          language={preferences.speechLanguage}
          onTranscription={handleVoiceTranscription}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
      
      {success && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Expense added successfully!
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium app-muted">Amount ({currencySymbol}) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 app-muted">{currencySymbol}</span>
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="app-field w-full rounded-lg py-3 pl-12 pr-4 transition"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium app-muted">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="app-field w-full rounded-lg px-4 py-3 transition"
          placeholder="e.g., Client lunch"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium app-muted">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="app-field w-full appearance-none rounded-lg px-4 py-3 transition"
          >
            <option value="">
              {preferences.autoCategorize ? 'Auto-categorize (AI)' : 'Choose category'}
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium app-muted">Date</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="app-field w-full rounded-lg px-4 py-3 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
