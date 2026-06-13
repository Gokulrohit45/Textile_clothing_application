import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SettingsContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      document.title = settings.siteName ? `${settings.siteName} - ${settings.tagline || 'Shop'}` : 'PSP garments and clothing';
      if (settings.logo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = settings.logo;
      }
    }
  }, [settings]);

  const updateSettings = async (updates) => {
    try {
      // Optimistic update
      setSettings(prev => ({ ...prev, ...updates }));
      
      const res = await fetch(`${API_URL}/settings/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      toast.success('Settings updated!');
    } catch (err) {
      toast.error('Failed to save settings');
      fetchSettings(); // Rollback
    }
  };

  const updateSocialLinks = async (links) => {
    const updatedLinks = { ...settings.socialLinks, ...links };
    await updateSettings({ socialLinks: updatedLinks });
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-200">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateSocialLinks, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
