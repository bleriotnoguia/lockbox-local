import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { useLockboxStore } from '../store';

export function useExportImport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchLockboxes = useLockboxStore((state) => state.fetchLockboxes);

  const exportLockboxes = async (): Promise<boolean> => {
    setIsExporting(true);
    setError(null);

    try {
      const filePath = await save({
        defaultPath: `lockbox-export-${Date.now()}.json`,
        filters: [
          { name: 'Lockbox Export', extensions: ['json', 'lbf'] },
        ],
      });

      if (!filePath) {
        setIsExporting(false);
        return false;
      }

      const data = await invoke<string>('export_lockboxes');
      await writeTextFile(filePath, data);

      setIsExporting(false);
      return true;
    } catch (err) {
      setError(String(err));
      setIsExporting(false);
      return false;
    }
  };

  const importLockboxes = async (): Promise<string[]> => {
    setIsImporting(true);
    setError(null);

    try {
      const filePath = await open({
        filters: [
          { name: 'Lockbox Export', extensions: ['json', 'lbf'] },
        ],
        multiple: false,
      });

      if (!filePath || typeof filePath !== 'string') {
        setIsImporting(false);
        return [];
      }

      const data = await readTextFile(filePath);
      const imported = await invoke<string[]>('import_lockboxes', { data });

      // Refresh the lockbox list
      await fetchLockboxes();

      setIsImporting(false);
      return imported;
    } catch (err) {
      setError(String(err));
      setIsImporting(false);
      return [];
    }
  };

  return {
    exportLockboxes,
    importLockboxes,
    isExporting,
    isImporting,
    error,
    clearError: () => setError(null),
  };
}
