import React, { useEffect, useState } from 'react';
import { TrendingUp, Activity, XCircle, Zap, Clock, Shield } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useLockboxStore } from '../store';
import { useTranslation } from '../i18n';
import type { AccessLogEntry } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Stats {
  totalRequests: number;
  totalCompleted: number;
  totalCancelled: number;
  totalPanic: number;
  totalExtensions: number;
  thisMonthRequests: number;
  thisMonthCompleted: number;
  thisMonthCancelled: number;
}

function computeStats(entries: AccessLogEntry[]): Stats {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthTs = startOfMonth.getTime();

  const count = (type: string, fromTs = 0) =>
    entries.filter((e) => e.event_type === type && e.timestamp >= fromTs).length;

  return {
    totalRequests: count('unlock_requested'),
    totalCompleted: count('unlock_completed'),
    totalCancelled: count('unlock_cancelled'),
    totalPanic: count('panic_used'),
    totalExtensions: count('extend_delay'),
    thisMonthRequests: count('unlock_requested', monthTs),
    thisMonthCompleted: count('unlock_completed', monthTs),
    thisMonthCancelled: count('unlock_cancelled', monthTs),
  };
}

function computeStreak(_lockboxes: unknown[], entries: AccessLogEntry[]): number {
  const completedTimestamps = entries
    .filter((e) => e.event_type === 'unlock_completed')
    .map((e) => e.timestamp)
    .sort((a, b) => b - a);

  if (completedTimestamps.length === 0) return 0;

  const now = Date.now();
  const lastAccess = completedTimestamps[0];
  const diffDays = Math.floor((now - lastAccess) / (1000 * 60 * 60 * 24));
  return diffDays;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, color = 'text-primary-600 dark:text-primary-400' }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <span className={color}>{icon}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const lockboxes = useLockboxStore((s) => s.lockboxes);
  const getGlobalAccessLog = useLockboxStore((s) => s.getGlobalAccessLog);
  const [entries, setEntries] = useState<AccessLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getGlobalAccessLog().then((data) => {
      setEntries(data);
      setIsLoading(false);
    });
  }, [isOpen, getGlobalAccessLog]);

  const stats = computeStats(entries);
  const streakDays = computeStreak(lockboxes, entries);

  const successRate =
    stats.totalRequests > 0
      ? Math.round((stats.totalCompleted / stats.totalRequests) * 100)
      : 0;

  const cancelRate =
    stats.totalRequests > 0
      ? Math.round((stats.totalCancelled / stats.totalRequests) * 100)
      : 0;

  const hasData = entries.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('stats.title')} size="xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : !hasData ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>{t('stats.noData')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* All-time stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('stats.allTime')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label={t('stats.totalUnlockRequests')}
                value={stats.totalRequests}
              />
              <StatCard
                icon={<Shield className="h-4 w-4" />}
                label={t('stats.totalUnlockCompleted')}
                value={stats.totalCompleted}
                sub={`${successRate}% ${t('stats.successRate')}`}
                color="text-green-600 dark:text-green-400"
              />
              <StatCard
                icon={<XCircle className="h-4 w-4" />}
                label={t('stats.totalCancellations')}
                value={stats.totalCancelled}
                sub={`${cancelRate}% ${t('stats.cancelRate')}`}
                color="text-red-500 dark:text-red-400"
              />
              <StatCard
                icon={<Zap className="h-4 w-4" />}
                label={t('stats.totalPanicUses')}
                value={stats.totalPanic}
                color="text-orange-500 dark:text-orange-400"
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label={t('stats.totalExtensions')}
                value={stats.totalExtensions}
                color="text-blue-500 dark:text-blue-400"
              />
              <StatCard
                icon={<Activity className="h-4 w-4" />}
                label={t('stats.totalLockboxes')}
                value={lockboxes.length}
              />
            </div>
          </div>

          {/* This month */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('stats.thisMonth')}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label={t('stats.totalUnlockRequests')}
                value={stats.thisMonthRequests}
              />
              <StatCard
                icon={<Shield className="h-4 w-4" />}
                label={t('stats.totalUnlockCompleted')}
                value={stats.thisMonthCompleted}
                color="text-green-600 dark:text-green-400"
              />
              <StatCard
                icon={<XCircle className="h-4 w-4" />}
                label={t('stats.totalCancellations')}
                value={stats.thisMonthCancelled}
                color="text-red-500 dark:text-red-400"
              />
            </div>
          </div>

          {/* Streak */}
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
              {t('stats.streakTitle')}
            </h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {t('stats.streakDays', { days: streakDays })}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
