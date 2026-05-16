import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Download, Upload, ShieldAlert, Sun, Moon, Monitor, Globe, Database, Settings as SettingsIcon, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useThemeStore, useSettingsStore } from '../store';
import { useExportImport } from '../hooks';
import { useTranslation } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'data';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { theme, setTheme } = useThemeStore();
  const {
    unlockedSoundEnabled,
    relockedSoundEnabled,
    setUnlockedSoundEnabled,
    setRelockedSoundEnabled,
  } = useSettingsStore();
  const { t, locale, setLocale } = useTranslation();
  
  const { exportLockboxes, importLockboxes, isExporting, isImporting, error: importError, clearError } = useExportImport();

  // Export success warning modal
  const [showExportWarning, setShowExportWarning] = useState(false);

  // Import password modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [sourcePassword, setSourcePassword] = useState('');

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title') || 'Settings'} size="lg">
        <div className="flex flex-col md:flex-row gap-6 min-h-[300px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-48 flex flex-col gap-1 border-r border-gray-200 dark:border-gray-700 pr-4">
            <button
              onClick={() => setActiveTab('general')}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                activeTab === 'general' 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <SettingsIcon className="w-4 h-4" />
              {t('settings.general') || 'General'}
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                activeTab === 'data' 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <Database className="w-4 h-4" />
              {t('settings.data') || 'Data'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'general' && (
              <>
                {/* Theme */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-gray-500" />
                    {t('settings.theme') || 'Theme'}
                  </h3>
                  <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                    <button
                      onClick={() => setTheme('light')}
                      className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                    >
                      <Sun className="w-4 h-4" />
                      {t('header.themeLight')}
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                    >
                      <Monitor className="w-4 h-4" />
                      {t('header.themeSystem')}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                    >
                      <Moon className="w-4 h-4" />
                      {t('header.themeDark')}
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    {t('settings.language') || 'Language'}
                  </h3>
                  <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                    <button
                      onClick={() => setLocale('en')}
                      className={clsx('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', locale === 'en' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLocale('fr')}
                      className={clsx('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', locale === 'fr' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                    >
                      Français
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    {t('settings.notifications') || 'Notifications'}
                  </h3>
                  <label className="flex items-start justify-between gap-4 cursor-pointer">
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {t('settings.unlockedSound') || 'Sound on unlock'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('settings.unlockedSoundDesc') || 'Play a sound when a lockbox is unlocked.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={unlockedSoundEnabled}
                      onClick={() => setUnlockedSoundEnabled(!unlockedSoundEnabled)}
                      className={clsx(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                        unlockedSoundEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <span
                        className={clsx(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          unlockedSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                  <label className="flex items-start justify-between gap-4 cursor-pointer">
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {t('settings.relockedSound') || 'Sound on relock'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('settings.relockedSoundDesc') || 'Play a sound when a lockbox is automatically relocked.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={relockedSoundEnabled}
                      onClick={() => setRelockedSoundEnabled(!relockedSoundEnabled)}
                      className={clsx(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                        relockedSoundEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <span
                        className={clsx(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          relockedSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.exportData') || 'Export Data'}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t('settings.exportDesc') || 'Export your lockboxes to a secure, encrypted file.'}
                  </p>
                  <Button onClick={handleExport} disabled={isExporting} variant="secondary" className="w-full justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    {t('header.export')}
                  </Button>
                </div>

                <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.importData') || 'Import Data'}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t('settings.importDesc') || 'Import lockboxes from a previously exported file.'}
                  </p>
                  <Button onClick={handleImportClick} disabled={isImporting} variant="secondary" className="w-full justify-center">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('header.import')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

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
    </>
  );
};
