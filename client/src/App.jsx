import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Settings from './pages/Settings';
import { applyPreferences, getPreferences, PREFERENCE_CHANGE_EVENT } from './services/preferences';

function App() {
  useEffect(() => {
    const syncPreferences = (event) => {
      applyPreferences(event?.detail || getPreferences());
    };

    syncPreferences();
    window.addEventListener(PREFERENCE_CHANGE_EVENT, syncPreferences);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', syncPreferences);

    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, syncPreferences);
      mediaQuery.removeEventListener('change', syncPreferences);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
