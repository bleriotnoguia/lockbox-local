import React from 'react';
import { toast } from 'react-toastify';
import { open } from '@tauri-apps/plugin-shell';
import {
  Plus,
  Search,
  Copy,
  ExternalLink,
  LogOut,
  Info,
  BookOpen,
  BarChart2,
  Wand2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from './ui/Button';
import { useLockboxStore, useAuthStore } from '../store';
import { useTranslation } from '../i18n';

interface HeaderProps {
  onCreateClick: () => void;
  onAboutClick: () => void;
  onDocsClick: () => void;
  onStatsClick: () => void;
  onGeneratorClick: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateClick, onAboutClick, onDocsClick, onStatsClick, onGeneratorClick, onSettingsClick }) => {
  const proUrl = 'https://lockbox.javascript.cm/';
  const { searchQuery, setSearchQuery } = useLockboxStore();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

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

  const openProPage = async () => {
    try {
      await open(proUrl);
    } catch {
      window.open(proUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const copyProUrl = async () => {
    try {
      await navigator.clipboard.writeText(proUrl);
      toast.success('Pro link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl overflow-hidden">
            <img src="/lockbox-logo.png" alt="Lockbox Local logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lockbox Local</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('header.subtitle')}</p>
              <button
                type="button"
                onClick={openProPage}
                className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-700/60 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                title="Open Lockbox Pro website"
              >
                PRO
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={copyProUrl}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Copy Pro link"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
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
          {/* Settings */}
          {iconBtn(onSettingsClick, <SettingsIcon className="h-5 w-5" />, t('settings.title') || 'Settings')}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Stats / Docs / About */}
          {iconBtn(onGeneratorClick, <Wand2 className="h-5 w-5" />, t('header.passwordGenerator'))}
          {iconBtn(onStatsClick, <BarChart2 className="h-5 w-5" />, t('header.stats'))}
          {iconBtn(onDocsClick, <BookOpen className="h-5 w-5" />, t('header.docs'))}
          {iconBtn(onAboutClick, <Info className="h-5 w-5" />, t('header.about'))}

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Logout */}
          {iconBtn(logout, <LogOut className="h-5 w-5" />, t('header.logout'))}

          {/* Create */}
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t('header.newLockbox')}
          </Button>
        </div>
      </div>
    </header>
  );
};
