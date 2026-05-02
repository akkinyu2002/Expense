export const PREFERENCES_STORAGE_KEY = 'expenseai.preferences.v1';
export const PREFERENCE_CHANGE_EVENT = 'expenseai:preferences-changed';

export const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other'];

export const accentOptions = [
  { id: 'blue', label: 'Blue', value: '#3b82f6', rgb: '59 130 246' },
  { id: 'emerald', label: 'Emerald', value: '#10b981', rgb: '16 185 129' },
  { id: 'amber', label: 'Amber', value: '#f59e0b', rgb: '245 158 11' },
  { id: 'rose', label: 'Rose', value: '#f43f5e', rgb: '244 63 94' },
];

export const currencyOptions = [
  { code: 'NPR', label: 'Nepalese Rupee', symbol: 'Rs.', locale: 'en-NP' },
  { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB' },
];

export const speechLanguageOptions = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'ne-NP', label: 'Nepali' },
  { code: 'hi-IN', label: 'Hindi' },
];

export const defaultPreferences = {
  theme: 'dark',
  accent: 'blue',
  density: 'comfortable',
  currency: 'NPR',
  monthlyBudget: 50000,
  weekStartsOn: 'sunday',
  defaultCategory: '',
  autoCategorize: true,
  speechLanguage: 'en-US',
  saveDrafts: true,
  showChartLegend: true,
  budgetAlerts: true,
  insightNudges: true,
  emailSummary: false,
  email: '',
};

const optionIds = (options, key = 'id') => options.map((option) => option[key]);

const normalizeChoice = (value, allowed, fallback) => (
  allowed.includes(value) ? value : fallback
);

export const normalizePreferences = (preferences = {}) => {
  const merged = { ...defaultPreferences, ...preferences };

  return {
    ...merged,
    theme: normalizeChoice(merged.theme, ['dark', 'light', 'system'], defaultPreferences.theme),
    accent: normalizeChoice(merged.accent, optionIds(accentOptions), defaultPreferences.accent),
    density: normalizeChoice(merged.density, ['comfortable', 'compact'], defaultPreferences.density),
    currency: normalizeChoice(merged.currency, optionIds(currencyOptions, 'code'), defaultPreferences.currency),
    weekStartsOn: normalizeChoice(
      merged.weekStartsOn,
      ['sunday', 'monday', 'saturday'],
      defaultPreferences.weekStartsOn,
    ),
    defaultCategory: normalizeChoice(merged.defaultCategory, ['', ...categories], defaultPreferences.defaultCategory),
    speechLanguage: normalizeChoice(
      merged.speechLanguage,
      optionIds(speechLanguageOptions, 'code'),
      defaultPreferences.speechLanguage,
    ),
    monthlyBudget: Math.max(0, Number(merged.monthlyBudget) || 0),
    autoCategorize: Boolean(merged.autoCategorize),
    saveDrafts: Boolean(merged.saveDrafts),
    showChartLegend: Boolean(merged.showChartLegend),
    budgetAlerts: Boolean(merged.budgetAlerts),
    insightNudges: Boolean(merged.insightNudges),
    emailSummary: Boolean(merged.emailSummary),
    email: String(merged.email || ''),
  };
};

export const getPreferences = () => {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }

  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return normalizePreferences(stored ? JSON.parse(stored) : defaultPreferences);
  } catch (error) {
    console.warn('Could not load preferences. Falling back to defaults.', error);
    return defaultPreferences;
  }
};

export const resolveTheme = (theme) => {
  if (theme !== 'system' || typeof window === 'undefined') {
    return theme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const applyPreferences = (preferences = getPreferences()) => {
  if (typeof document === 'undefined') {
    return;
  }

  const normalized = normalizePreferences(preferences);
  const accent = accentOptions.find((option) => option.id === normalized.accent) || accentOptions[0];
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(normalized.theme);

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = normalized.theme;
  root.dataset.density = normalized.density;
  root.dataset.accent = normalized.accent;
  root.style.setProperty('--accent', accent.value);
  root.style.setProperty('--accent-rgb', accent.rgb);
  root.style.colorScheme = resolvedTheme;
};

export const savePreferences = (preferences) => {
  const normalized = normalizePreferences(preferences);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
    applyPreferences(normalized);
    window.dispatchEvent(new CustomEvent(PREFERENCE_CHANGE_EVENT, { detail: normalized }));
  }

  return normalized;
};

export const resetPreferences = () => savePreferences(defaultPreferences);

export const getCurrencyOption = (preferences = getPreferences()) => (
  currencyOptions.find((option) => option.code === preferences.currency) || currencyOptions[0]
);

export const getCurrencySymbol = (preferences = getPreferences()) => (
  getCurrencyOption(preferences).symbol
);

export const formatCurrency = (amount, preferences = getPreferences()) => {
  const currency = getCurrencyOption(preferences);
  const numericAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    }).format(numericAmount);
  } catch {
    return `${currency.symbol} ${numericAmount.toLocaleString()}`;
  }
};
