import React, { useMemo } from 'react';
import { Folder, Tag, BarChart2, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import { useLockboxStore } from '../store';
import { useTranslation } from '../i18n';
import { CATEGORIES, parseTags } from '../types';

interface SidebarProps {
  onStatsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onStatsClick }) => {
  const { selectedCategory, setSelectedCategory, selectedTag, setSelectedTag, lockboxes } = useLockboxStore();
  const { t } = useTranslation();

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lb of lockboxes) {
      for (const tag of parseTags(lb.tags)) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [lockboxes]);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = lockboxes.filter((lb) => lb.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const uncategorizedCount = lockboxes.filter((lb) => !lb.category).length;

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="flex-1">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {t('sidebar.categories')}
        </h2>
        <nav className="space-y-1">
          {/* All */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
              selectedCategory === null
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>{t('sidebar.all')}</span>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {lockboxes.length}
            </span>
          </button>

          {/* Categories */}
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedCategory === category
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{t(`category.${category}` as 'category.Passwords')}</span>
              </div>
              {categoryCounts[category] > 0 && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {categoryCounts[category]}
                </span>
              )}
            </button>
          ))}

          {/* Uncategorized */}
          {uncategorizedCount > 0 && (
            <button
              onClick={() => setSelectedCategory('__uncategorized__')}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedCategory === '__uncategorized__'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 opacity-50" />
                <span>{t('sidebar.uncategorized')}</span>
              </div>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {uncategorizedCount}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Tags section */}
      {allTags.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('tags.filterTitle')}
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedTag === null
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>{t('tags.all')}</span>
              </div>
            </button>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedTag === tag
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>{tag}</span>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {t('sidebar.stats')}
        </h2>
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('sidebar.total')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{lockboxes.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('sidebar.locked')}</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {lockboxes.filter((lb) => lb.is_locked).length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('sidebar.unlocked')}</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {lockboxes.filter((lb) => !lb.is_locked).length}
            </span>
          </div>
        </div>
        <button
          onClick={onStatsClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          {t('sidebar.viewStats')}
        </button>
      </div>
    </aside>
  );
};
