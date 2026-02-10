import React from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { useLockboxStore, useThemeStore, useAuthStore } from '../store';
import { useExportImport } from '../hooks';
import { useTranslation } from '../i18n';

interface HeaderProps {
  onCreateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  const { searchQuery, setSearchQuery } = useLockboxStore();
  const { theme, setTheme } = useThemeStore();
  const { t, locale, setLocale } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const { exportLockboxes, importLockboxes, isExporting, isImporting } =
    useExportImport();

  const handleImport = async () => {
    const imported = await importLockboxes();
    if (imported.length > 0) {
      alert(t('header.importedCount', { count: imported.length }));
    }
  };

  const handleExport = async () => {
    const success = await exportLockboxes();
    if (success) {
      alert(t('header.exportSuccess'));
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg
              className="h-8 w-8 text-primary-600 dark:text-primary-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Lockbox Local
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('header.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title={t('header.import')}
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title={t('header.export')}
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mx-2">
            <button
              onClick={() => setTheme('light')}
              className={clsx(
                'p-1.5 rounded-md transition-colors',
                theme === 'light'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              title={t('header.themeLight')}
            >
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={clsx(
                'p-1.5 rounded-md transition-colors',
                theme === 'system'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              title={t('header.themeSystem')}
            >
              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={clsx(
                'p-1.5 rounded-md transition-colors',
                theme === 'dark'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              title="Sombre"
            >
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Language switcher */}
          <div className="flex gap-1 mr-1">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                locale === 'en' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('fr')}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                locale === 'fr' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Français"
            >
              FR
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('header.logout')}
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Create Button */}
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t('header.newLockbox')}
          </Button>
        </div>
      </div>
    </header>
  );
};
