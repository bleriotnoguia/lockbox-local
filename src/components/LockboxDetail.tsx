import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { clsx } from "clsx";
import type { Lockbox } from "../types";
import { Button } from "./ui/Button";
import { ConfirmModal } from "./ui/Modal";
import { useLockboxStore } from "../store";
import { useCountdown, formatTimeRemaining } from "../hooks/useCountdown";
import { useLockboxStatus, getStatusColor, getStatusKey } from "../hooks/useLockboxStatus";
import { useTranslation } from "../i18n";

interface LockboxDetailProps {
  lockbox: Lockbox;
  onClose: () => void;
}

export const LockboxDetail: React.FC<LockboxDetailProps> = ({
  lockbox,
  onClose,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const { unlockLockbox, relockLockbox, deleteLockbox, fetchLockboxDecrypted } =
    useLockboxStore();
  const status = useLockboxStatus(lockbox);
  const { t, formatDelay } = useTranslation();

  // Fetch decrypted content when lockbox becomes unlocked
  useEffect(() => {
    if (status === "unlocked" && !decryptedContent) {
      setIsLoadingContent(true);
      fetchLockboxDecrypted(lockbox.id).then((lb) => {
        if (lb) {
          setDecryptedContent(lb.content);
        }
        setIsLoadingContent(false);
      });
    } else if (status !== "unlocked") {
      // Clear decrypted content when locked
      setDecryptedContent(null);
    }
  }, [status, lockbox.id, fetchLockboxDecrypted, decryptedContent]);

  // Get the content to display
  const displayContent = decryptedContent || lockbox.content;

  const targetTimestamp =
    status === "unlocking"
      ? lockbox.unlock_timestamp
      : status === "unlocked"
        ? lockbox.relock_timestamp
        : null;

  const timeRemaining = useCountdown(targetTimestamp);

  const handleUnlock = async () => {
    try {
      await unlockLockbox(lockbox.id);
      setShowUnlockConfirm(false);
    } catch (error) {
      console.error("Failed to unlock:", error);
    }
  };

  const handleRelock = async () => {
    try {
      await relockLockbox(lockbox.id);
    } catch (error) {
      console.error("Failed to relock:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLockbox(lockbox.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUnlocked = status === "unlocked";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "p-3 rounded-xl",
              isUnlocked
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30",
            )}
          >
            {isUnlocked ? (
              <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {lockbox.name}
            </h2>
            <span
              className={clsx(
                "inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1",
                getStatusColor(status),
              )}
            >
              {t(getStatusKey(status))}
            </span>
          </div>
        </div>
      </div>

      {/* Timer */}
      {timeRemaining && timeRemaining.total > 0 && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
            <Clock className="h-5 w-5 animate-countdown" />
            <span className="font-medium">
              {status === "unlocking"
                ? t("lockboxDetail.unlockIn")
                : t("lockboxDetail.relockIn")}
            </span>
          </div>
          <p className="text-3xl font-mono font-bold text-primary-600 dark:text-primary-400 mt-2">
            {formatTimeRemaining(timeRemaining)}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("lockboxDetail.content")}
          </label>
          {isUnlocked && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowContent(!showContent)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={showContent ? t("lockboxDetail.hide") : t("lockboxDetail.show")}
              >
                {showContent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t("lockboxDetail.copy")}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl min-h-[120px] flex flex-col">
          {isUnlocked ? (
            isLoadingContent ? (
              <div className="flex flex-1 min-h-[80px] items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mr-2" />
                <span>{t("lockboxDetail.decrypting")}</span>
              </div>
            ) : (
              <p
                className={clsx(
                  "text-gray-900 dark:text-white whitespace-pre-wrap break-all font-mono flex-1",
                  !showContent && "blur-sm select-none",
                )}
              >
                {displayContent}
              </p>
            )
          ) : (
            <div className="flex flex-1 min-h-[80px] items-center justify-center text-gray-500 dark:text-gray-400">
              <Lock className="h-5 w-5 mr-2 shrink-0" />
              <span>{t("lockboxDetail.contentLocked")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("lockboxDetail.unlockDelay")}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDelay(lockbox.unlock_delay_seconds)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("lockboxDetail.relockDelay")}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDelay(lockbox.relock_delay_seconds)}
          </p>
        </div>
      </div>

      {/* Category */}
      {lockbox.category && (
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("lockboxDetail.category")}</p>
            <p className="font-medium text-gray-900 dark:text-white">
            {lockbox.category ? t(`category.${lockbox.category}` as 'category.Passwords') : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {status === "locked" && (
          <Button onClick={() => setShowUnlockConfirm(true)} className="flex-1">
            <Unlock className="h-4 w-4 mr-2" />
            {t("lockboxDetail.unlock")}
          </Button>
        )}

        {status === "unlocking" && (
          <Button variant="secondary" className="flex-1" disabled>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            {t("lockboxDetail.unlocking")}
          </Button>
        )}

        {status === "unlocked" && (
          <Button onClick={handleRelock} variant="secondary" className="flex-1">
            <Lock className="h-4 w-4 mr-2" />
            {t("lockboxDetail.relockNow")}
          </Button>
        )}

        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showUnlockConfirm}
        onClose={() => setShowUnlockConfirm(false)}
        onConfirm={handleUnlock}
        title="Déverrouiller la lockbox ?"
        message={`Le déverrouillage prendra ${formatDelay(lockbox.unlock_delay_seconds)}. Êtes-vous sûr de vouloir continuer ?`}
        confirmText="Déverrouiller"
        variant="warning"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t("lockboxDetail.deleteConfirmTitle")}
        message={t("lockboxDetail.deleteConfirmMessage")}
        confirmText={t("lockboxDetail.delete")}
        variant="danger"
      />
    </div>
  );
};
