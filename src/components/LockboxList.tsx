import React from 'react';
import { Package } from 'lucide-react';
import { LockboxCard } from './LockboxCard';
import { useFilteredLockboxes, useLockboxStore } from '../store';
import type { Lockbox } from '../types';

interface LockboxListProps {
  onSelectLockbox: (lockbox: Lockbox) => void;
  selectedId?: number;
}

export const LockboxList: React.FC<LockboxListProps> = ({
  onSelectLockbox,
  selectedId,
}) => {
  const filteredLockboxes = useFilteredLockboxes();
  const isLoading = useLockboxStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (filteredLockboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <Package className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Aucune lockbox trouvée</p>
        <p className="text-sm">Créez votre première lockbox pour commencer</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {filteredLockboxes.map((lockbox) => (
        <LockboxCard
          key={lockbox.id}
          lockbox={lockbox}
          onClick={() => onSelectLockbox(lockbox)}
          isSelected={lockbox.id === selectedId}
        />
      ))}
    </div>
  );
};
