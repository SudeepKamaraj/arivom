import React, { useEffect, useState } from 'react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pref_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pref_dark_mode', String(darkMode));
  }, [darkMode]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-dark-gunmetal dark:text-white">Settings</h1>
      <p className="text-sm text-dark-gunmetal/70 dark:text-white/70 mt-1">General application preferences</p>

      <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Email notifications</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Receive updates about your courses</div>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Reduce glare and improve readability</div>
          </div>
          <input type="checkbox" className="h-4 w-4" checked={darkMode} onChange={(e)=>setDarkMode(e.target.checked)} />
        </div>
      </div>
    </div>
  );
};

export default Settings;



