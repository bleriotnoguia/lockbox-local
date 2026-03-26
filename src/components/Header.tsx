import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Info,
  BookOpen,
  BarChart2,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useLockboxStore, useThemeStore, useAuthStore } from '../store';
import { useExportImport } from '../hooks';
import { useTranslation } from '../i18n';

interface HeaderProps {
  onCreateClick: () => void;
  onAboutClick: () => void;
  onDocsClick: () => void;
  onStatsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateClick, onAboutClick, onDocsClick, onStatsClick }) => {
  const { searchQuery, setSearchQuery } = useLockboxStore();
  const { theme, setTheme } = useThemeStore();
  const { t, locale, setLocale } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const { exportLockboxes, importLockboxes, isExporting, isImporting, error: importError, clearError } = useExportImport();

  // Export success warning modal
  const [showExportWarning, setShowExportWarning] = useState(false);

  // Import password modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [sourcePassword, setSourcePassword] = useState('');

  /** Maps a raw Rust error string to a human-readable message */
  const humanizeImportError = (raw: string): string => {
    if (raw.includes('Integrity check failed') || raw.includes('tampered')) {
      return t('header.importErrorIntegrity');
    }
    if (raw.includes('wrong source password') || raw.includes('Failed to decrypt')) {
      return t('header.importErrorPassword');
    }
    if (raw.includes('Invalid file format') || raw.includes('invalid') || raw.includes('parse')) {
      return t('header.importErrorFormat');
    }
    return t('header.importErrorGeneric', { detail: raw });
  };

  const handleExport = async () => {
    clearError();
    const success = await exportLockboxes();
    if (success) {
      setShowExportWarning(true);
    } else {
      toast.error('Export failed. Check file permissions or try a different folder.');
    }
  };

  const handleImportClick = () => {
    setSourcePassword('');
    clearError();
    setShowImportModal(true);
  };

  const doImport = async (password: string | null) => {
    setShowImportModal(false);
    clearError();
    const imported = await importLockboxes(password);
    if (imported.length > 0) {
      toast.success(t('header.importedCount', { count: imported.length }));
    } else {
      setPostImportCheck(true);
    }
  };

  // Post-import: read error state after React re-render
  const [postImportCheck, setPostImportCheck] = useState(false);
  useEffect(() => {
    if (!postImportCheck) return;
    setPostImportCheck(false);
    if (importError) {
      toast.error(humanizeImportError(importError), { autoClose: 7000 });
    } else {
      toast.info(t('header.importNoneNew'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postImportCheck, importError]);

  const iconBtn = (onClick: () => void, icon: React.ReactNode, title: string, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lockbox Local</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('header.subtitle')}</p>
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
        <div className="flex items-center gap-1.5">
          {/* Import/Export */}
          {iconBtn(handleImportClick, <Upload className="h-5 w-5" />, t('header.import'), isImporting)}
          {iconBtn(handleExport, <Download className="h-5 w-5" />, t('header.export'), isExporting)}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Stats / Docs / About */}
          {iconBtn(onStatsClick, <BarChart2 className="h-5 w-5" />, t('header.stats'))}
          {iconBtn(onDocsClick, <BookOpen className="h-5 w-5" />, t('header.docs'))}
          {iconBtn(onAboutClick, <Info className="h-5 w-5" />, t('header.about'))}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Theme Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTheme('light')}
              className={clsx('p-1.5 rounded-md transition-colors', theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
              title={t('header.themeLight')}
            >
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={clsx('p-1.5 rounded-md transition-colors', theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
              title={t('header.themeSystem')}
            >
              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={clsx('p-1.5 rounded-md transition-colors', theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600')}
              title={t('header.themeDark')}
            >
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Language */}
          <div className="flex gap-1 mx-1">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${locale === 'en' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('fr')}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${locale === 'fr' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title="Français"
            >
              FR
            </button>
          </div>

          {/* Logout */}
          {iconBtn(logout, <LogOut className="h-5 w-5" />, t('header.logout'))}

          {/* Create */}
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t('header.newLockbox')}
          </Button>
        </div>
      </div>
      {/* Export success + warning modal */}
      <Modal isOpen={showExportWarning} onClose={() => setShowExportWarning(false)} title={t('header.exportWarningTitle')} size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">{t('header.exportWarningBody')}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowExportWarning(false)}>{t('common.close')}</Button>
          </div>
        </div>
      </Modal>

      {/* Import — source password modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title={t('header.importPasswordTitle')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('header.importPasswordBody')}</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('header.importPasswordLabel')}
            </label>
            <input
              type="password"
              value={sourcePassword}
              onChange={(e) => setSourcePassword(e.target.value)}
              placeholder={t('header.importPasswordPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && sourcePassword && doImport(sourcePassword)}
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => doImport(null)}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('header.importPasswordSkip')}
            </button>
            <Button onClick={() => doImport(sourcePassword || null)} disabled={isImporting}>
              {t('header.importPasswordConfirm')}
            </Button>
          </div>
        </div>
      </Modal>

    </header>
  );
};
