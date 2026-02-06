import React, { useEffect, useState } from 'react';
import {
  Header,
  Sidebar,
  LockboxList,
  LockboxDetail,
  CreateLockboxModal,
  LoginScreen,
} from './components';
import { useLockboxStore, useAuthStore } from './store';
import type { Lockbox } from './types';

export const App: React.FC = () => {
  const [selectedLockbox, setSelectedLockbox] = useState<Lockbox | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    isAuthenticated,
    isLoading: authLoading,
    checkMasterPassword,
  } = useAuthStore();

  const {
    fetchLockboxes,
    checkAndUpdateStates,
    lockboxes,
  } = useLockboxStore();

  // Check if master password is set on mount
  useEffect(() => {
    checkMasterPassword();
  }, [checkMasterPassword]);

  // Fetch lockboxes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLockboxes();
    }
  }, [isAuthenticated, fetchLockboxes]);

  // Periodically check and update lockbox states
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkAndUpdateStates();
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndUpdateStates]);

  // Update selected lockbox when lockboxes change
  useEffect(() => {
    if (selectedLockbox) {
      const updated = lockboxes.find((lb) => lb.id === selectedLockbox.id);
      if (updated) {
        setSelectedLockbox(updated);
      }
    }
  }, [lockboxes, selectedLockbox]);

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex overflow-hidden">
          {/* Lockbox List */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <LockboxList
              onSelectLockbox={setSelectedLockbox}
              selectedId={selectedLockbox?.id}
            />
          </div>

          {/* Lockbox Detail */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedLockbox ? (
              <LockboxDetail
                lockbox={selectedLockbox}
                onClose={() => setSelectedLockbox(null)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <svg
                  className="h-24 w-24 mb-4 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
                <p className="text-lg font-medium">Sélectionnez une lockbox</p>
                <p className="text-sm">
                  Cliquez sur une lockbox pour voir ses détails
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateLockboxModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default App;
