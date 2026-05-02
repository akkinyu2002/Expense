import { useCallback, useEffect, useState } from 'react';
import {
  getPreferences,
  PREFERENCE_CHANGE_EVENT,
  resetPreferences,
  savePreferences,
} from '../services/preferences';

const usePreferences = () => {
  const [preferences, setPreferences] = useState(() => getPreferences());

  useEffect(() => {
    const handlePreferencesChange = (event) => {
      setPreferences(event.detail || getPreferences());
    };

    const handleStorageChange = (event) => {
      if (!event || !event.key || event.key.includes('expenseai.preferences')) {
        setPreferences(getPreferences());
      }
    };

    window.addEventListener(PREFERENCE_CHANGE_EVENT, handlePreferencesChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, handlePreferencesChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updatePreferences = useCallback((nextPreferences) => {
    const currentPreferences = getPreferences();
    const next = typeof nextPreferences === 'function'
      ? nextPreferences(currentPreferences)
      : { ...currentPreferences, ...nextPreferences };

    return savePreferences(next);
  }, []);

  const reset = useCallback(() => resetPreferences(), []);

  return { preferences, updatePreferences, resetPreferences: reset };
};

export default usePreferences;
