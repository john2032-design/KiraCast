import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { storage } from '@/services/storage';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.getSettings();
    setSettings(saved);
    setLoaded(true);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      storage.saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    storage.saveSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}
