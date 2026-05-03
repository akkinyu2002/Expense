import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, PlusCircle, Settings, Target, Wallet } from 'lucide-react';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

const Layout = () => {
  const location = useLocation();
  const { preferences } = usePreferences();

  const primaryNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ListChecks },
    { name: 'Add Expense', path: '/add', icon: PlusCircle },
  ];
  const settingsNavItem = { name: 'Settings', path: '/settings', icon: Settings };
  const navItems = [...primaryNavItems, settingsNavItem];
  const renderSidebarLink = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        to={item.path}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
          isActive
            ? 'accent-soft accent-ring'
            : 'app-muted hover:text-[var(--app-text)] hover:bg-[var(--app-panel)]'
        }`}
      >
        <Icon size={20} className={isActive ? '' : 'opacity-70'} />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans app-text">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-panel-strong)] md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="accent-soft p-2 rounded-lg">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-semibold app-text">
            ExpenseAI
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {primaryNavItems.map(renderSidebarLink)}
        </nav>

        <div className="m-4 space-y-3">
          <div className="rounded-lg app-surface p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target size={16} className="text-emerald-400" />
              Monthly Focus
            </div>
            <p className="mt-2 text-xs app-muted">Budget target</p>
            <p className="mt-1 text-lg font-bold">{formatCurrency(preferences.monthlyBudget, preferences)}</p>
          </div>
          {renderSidebarLink(settingsNavItem)}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 relative overflow-y-auto overflow-x-hidden"
        style={{
          background: 'var(--app-bg)',
        }}
      >
        <header className="sticky top-0 z-30 border-b border-[var(--app-border)] bg-[var(--app-panel-strong)] px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <div className="accent-soft p-2 rounded-lg">
              <Wallet size={20} />
            </div>
            <div>
              <p className="font-bold leading-tight">ExpenseAI</p>
              <p className="text-xs app-muted">{formatCurrency(preferences.monthlyBudget, preferences)} monthly target</p>
            </div>
          </div>
        </header>

        <div className="relative z-10 w-full max-w-6xl mx-auto min-h-full px-4 py-5 pb-28 md:p-[var(--page-pad)]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Nav (Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--app-border)] bg-[var(--app-panel-strong)] px-4 py-2 md:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                isActive ? 'accent-soft' : 'app-muted'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
