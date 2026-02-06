import React from 'react';
import { Folder, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { useLockboxStore } from '../store';
import { CATEGORIES } from '../types';

export const Sidebar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, lockboxes } = useLockboxStore();

  // Count lockboxes per category
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = lockboxes.filter((lb) => lb.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const uncategorizedCount = lockboxes.filter((lb) => !lb.category).length;

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Catégories
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
              <span>Toutes</span>
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
                <span>{category}</span>
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
                <span>Non catégorisées</span>
              </div>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {uncategorizedCount}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Stats */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Statistiques
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {lockboxes.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Verrouillées</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {lockboxes.filter((lb) => lb.is_locked).length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Déverrouillées</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {lockboxes.filter((lb) => !lb.is_locked).length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
