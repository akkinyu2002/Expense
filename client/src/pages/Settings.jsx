import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  Download,
  Mail,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Wallet,
  Zap,
} from 'lucide-react';
import usePreferences from '../hooks/usePreferences';
import {
  accentOptions,
  categories,
  currencyOptions,
  formatCurrency,
  speechLanguageOptions,
} from '../services/preferences';

const tabs = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'data', label: 'Data', icon: Settings2 },
];

const themeOptions = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
];

const densityOptions = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

const weekOptions = [
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
  { id: 'saturday', label: 'Saturday' },
];

const Toggle = ({ checked, label, description, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] p-4 text-left transition hover:border-[var(--accent)]"
  >
    <span>
      <span className="block font-medium app-text">{label}</span>
      {description ? <span className="mt-1 block text-sm app-muted">{description}</span> : null}
    </span>
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
        checked
          ? 'border-transparent bg-[var(--accent)]'
          : 'border-[var(--app-border)] bg-slate-700/50'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </span>
  </button>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium app-muted">{label}</span>
    {children}
  </label>
);

const Section = ({ icon: Icon, title, children }) => (
  <section className="app-surface rounded-lg p-5">
    <div className="mb-4 flex items-center gap-3">
      <div className="accent-soft rounded-lg p-2">
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-semibold app-text">{title}</h2>
    </div>
    {children}
  </section>
);

const Settings = () => {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const [draft, setDraft] = useState(preferences);
  const [activeTab, setActiveTab] = useState('general');
  const [status, setStatus] = useState('Saved');
  const [testAlert, setTestAlert] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(preferences),
    [draft, preferences],
  );

  const budgetUsed = 18750;
  const budgetPercent = draft.monthlyBudget > 0
    ? Math.min(100, Math.round((budgetUsed / draft.monthlyBudget) * 100))
    : 0;

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus('Unsaved changes');
  };

  const handleSave = () => {
    const saved = updatePreferences(draft);
    setDraft(saved);
    setStatus('Saved');
  };

  const handleReset = () => {
    if (!window.confirm('Reset all settings to their defaults?')) {
      return;
    }

    const defaults = resetPreferences();
    setDraft(defaults);
    setStatus('Reset complete');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'expenseai-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Settings exported');
  };

  const handleTestAlert = () => {
    if (!draft.budgetAlerts) {
      setTestAlert({
        title: 'Budget alerts are off',
        message: 'Turn on budget alerts to preview the monthly spending warning.',
      });
      setStatus('Budget alerts are off');
      return;
    }

    setTestAlert({
      title: 'Test budget alert',
      message: `${formatCurrency(budgetUsed, draft)} used of ${formatCurrency(draft.monthlyBudget, draft)} in this preview.`,
    });
    setStatus('Test alert shown');
  };

  const renderGeneral = () => (
    <div className="space-y-5">
      <Section icon={Palette} title="Appearance">
        <div className="grid gap-4">
          <div>
            <span className="mb-2 block text-sm font-medium app-muted">Theme</span>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = draft.theme === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateDraft('theme', option.id)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-[var(--control-y)] text-sm font-medium transition ${
                      isActive
                        ? 'accent-soft accent-ring'
                        : 'border-[var(--app-border)] bg-[var(--app-input)] app-muted hover:text-[var(--app-text)]'
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium app-muted">Accent</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {accentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateDraft('accent', option.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-[var(--control-y)] text-sm font-medium transition ${
                    draft.accent === option.id
                      ? 'accent-ring bg-[var(--app-panel-strong)] app-text'
                      : 'border-[var(--app-border)] bg-[var(--app-input)] app-muted hover:text-[var(--app-text)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: option.value }}
                    />
                    {option.label}
                  </span>
                  {draft.accent === option.id ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium app-muted">Density</span>
            <div className="grid grid-cols-2 gap-2">
              {densityOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateDraft('density', option.id)}
                  className={`rounded-lg border px-3 py-[var(--control-y)] text-sm font-medium transition ${
                    draft.density === option.id
                      ? 'accent-soft accent-ring'
                      : 'border-[var(--app-border)] bg-[var(--app-input)] app-muted hover:text-[var(--app-text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Wallet} title="Money">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Currency">
            <select
              value={draft.currency}
              onChange={(event) => updateDraft('currency', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            >
              {currencyOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Monthly budget">
            <input
              type="number"
              min="0"
              step="100"
              value={draft.monthlyBudget}
              onChange={(event) => updateDraft('monthlyBudget', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            />
          </Field>

          <Field label="Week starts on">
            <select
              value={draft.weekStartsOn}
              onChange={(event) => updateDraft('weekStartsOn', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            >
              {weekOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-5">
      <Section icon={Sparkles} title="Expense Defaults">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Default category">
            <select
              value={draft.defaultCategory}
              onChange={(event) => updateDraft('defaultCategory', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            >
              <option value="">No default</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Voice language">
            <select
              value={draft.speechLanguage}
              onChange={(event) => updateDraft('speechLanguage', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
            >
              {speechLanguageOptions.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 grid gap-3">
          <Toggle
            checked={draft.autoCategorize}
            label="AI auto-categorization"
            description="Leave category blank when adding a new expense."
            onChange={(value) => updateDraft('autoCategorize', value)}
          />
          <Toggle
            checked={draft.saveDrafts}
            label="Save unfinished expense forms"
            description="Keep typed values when moving between pages."
            onChange={(value) => updateDraft('saveDrafts', value)}
          />
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <div className="grid gap-3">
          <Toggle
            checked={draft.budgetAlerts}
            label="Budget alerts"
            description="Show a status when spending nears the monthly target."
            onChange={(value) => updateDraft('budgetAlerts', value)}
          />
          <Toggle
            checked={draft.insightNudges}
            label="Insight nudges"
            description="Highlight new spending patterns on the dashboard."
            onChange={(value) => updateDraft('insightNudges', value)}
          />
          <Toggle
            checked={draft.emailSummary}
            label="Email summary"
            description="Keep an email ready for summary delivery."
            onChange={(value) => updateDraft('emailSummary', value)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <Field label="Summary email">
            <input
              type="email"
              value={draft.email}
              onChange={(event) => updateDraft('email', event.target.value)}
              className="app-field w-full rounded-lg px-3 py-[var(--control-y)]"
              placeholder="name@example.com"
            />
          </Field>
          <button
            type="button"
            onClick={handleTestAlert}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-[var(--control-y)] font-medium transition hover:border-[var(--accent)]"
          >
            <Bell size={16} />
            Test alert
          </button>
        </div>

        {testAlert ? (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-300">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-semibold">{testAlert.title}</p>
              <p className="mt-1 text-sm text-amber-100/80">{testAlert.message}</p>
            </div>
          </div>
        ) : null}
      </Section>
    </div>
  );

  const renderData = () => (
    <div className="space-y-5">
      <Section icon={Settings2} title="Dashboard Data">
        <div className="grid gap-3">
          <Toggle
            checked={draft.showChartLegend}
            label="Chart legend"
            description="Show category labels beside spending charts."
            onChange={(value) => updateDraft('showChartLegend', value)}
          />
        </div>
      </Section>

      <Section icon={Download} title="Backups">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:brightness-110"
          >
            <Download size={18} />
            Export settings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/15"
          >
            <RefreshCw size={18} />
            Reset settings
          </button>
        </div>
      </Section>
    </div>
  );

  const renderActivePanel = () => {
    if (activeTab === 'automation') return renderAutomation();
    if (activeTab === 'data') return renderData();
    return renderGeneral();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg accent-soft accent-ring px-3 py-1 text-sm font-medium">
            <Settings2 size={15} />
            {status}
          </p>
          <h1 className="text-3xl font-bold app-text">Settings</h1>
          <p className="mt-1 app-muted">Personalize the app and keep your preferences saved.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-4 py-2 font-medium transition hover:border-red-400/50 hover:text-red-300"
          >
            <RefreshCw size={17} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />
            Save changes
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px]">
        <nav className="app-surface flex gap-2 overflow-x-auto rounded-lg p-2 lg:flex-col lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'accent-soft accent-ring'
                    : 'app-muted hover:bg-[var(--app-input)] hover:text-[var(--app-text)]'
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div>{renderActivePanel()}</div>

        <aside className="app-surface h-fit rounded-lg p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="accent-soft rounded-lg p-2">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="font-semibold app-text">Live Preview</h2>
              <p className="text-sm app-muted">{formatCurrency(2750, draft)} sample expense</p>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm app-muted">Monthly budget</p>
                <p className="text-xl font-bold app-text">{formatCurrency(draft.monthlyBudget, draft)}</p>
              </div>
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-300">
                <Check size={18} />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700/50">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm app-muted">
              {budgetPercent}% used in preview
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/15 p-2 text-amber-300">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-medium app-text">
                  {draft.emailSummary ? 'Email summary on' : 'Email summary off'}
                </p>
                <p className="text-sm app-muted">{draft.email || 'No email set'}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
