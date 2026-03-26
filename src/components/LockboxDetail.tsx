import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Lock,
  Unlock,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  PlusCircle,
  Zap,
  Tag,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Info,
} from "lucide-react";
import { clsx } from "clsx";
import type { Lockbox, AccessLogEntry } from "../types";
import { parseTags } from "../types";
import { Button } from "./ui/Button";
import { ConfirmModal } from "./ui/Modal";
import { Tooltip } from "./ui/Tooltip";
import { useLockboxStore } from "../store";
import { useCountdown, formatTimeRemaining } from "../hooks/useCountdown";
import {
  useLockboxStatus,
  getStatusColor,
  getStatusKey,
} from "../hooks/useLockboxStatus";
import { useTranslation } from "../i18n";
import { ReflectionModal } from "./ReflectionModal";
import { ExtendDelayModal } from "./ExtendDelayModal";

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showExtendDelay, setShowExtendDelay] = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [showPanicInput, setShowPanicInput] = useState(false);
  const [panicCode, setPanicCode] = useState("");
  const [panicError, setPanicError] = useState("");
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const {
    unlockLockbox,
    cancelUnlock,
    extendUnlockDelay,
    usePanicCode,
    relockLockbox,
    deleteLockbox,
    fetchLockboxDecrypted,
    getAccessLog,
  } = useLockboxStore();

  const status = useLockboxStatus(lockbox);
  const { t, formatDelay } = useTranslation();

  // Fetch decrypted content when unlocked
  useEffect(() => {
    if (status === "unlocked" && !decryptedContent) {
      setIsLoadingContent(true);
      fetchLockboxDecrypted(lockbox.id).then((lb) => {
        if (lb) setDecryptedContent(lb.content);
        setIsLoadingContent(false);
      });
    } else if (status !== "unlocked") {
      setDecryptedContent(null);
    }
  }, [status, lockbox.id, fetchLockboxDecrypted, decryptedContent]);

  // Fetch access log when section opens
  useEffect(() => {
    if (!showAccessLog) return;
    getAccessLog(lockbox.id).then(setAccessLog);
  }, [showAccessLog, lockbox.id, getAccessLog]);

  const displayContent = decryptedContent || lockbox.content;

  const targetTimestamp =
    status === "unlocking"
      ? lockbox.unlock_timestamp
      : status === "scheduled"
        ? lockbox.scheduled_unlock_at
        : status === "unlocked"
          ? lockbox.relock_timestamp
          : null;

  const timeRemaining = useCountdown(targetTimestamp);
  const isUnlocked = status === "unlocked";
  const canCancel = status === "unlocking" || status === "scheduled";

  const handleUnlockConfirmed = () => {
    setShowUnlockConfirm(false);
    if (lockbox.reflection_enabled) {
      setShowReflection(true);
    } else {
      doUnlock();
    }
  };

  const doUnlock = async () => {
    try {
      await unlockLockbox(lockbox.id);
    } catch (error) {
      console.error("Failed to unlock:", error);
    }
  };

  const handleCancelUnlock = async () => {
    try {
      await cancelUnlock(lockbox.id);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Failed to cancel unlock:", error);
    }
  };

  const handleExtendDelay = async (additionalSeconds: number) => {
    await extendUnlockDelay(lockbox.id, additionalSeconds);
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
      toast.success(t("lockboxDetail.deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t("lockboxDetail.contentCopied"));
  };

  const handleUsePanicCode = async () => {
    if (!panicCode.trim()) return;
    setPanicError("");
    try {
      const result = await usePanicCode(lockbox.id, panicCode.trim());
      if (result) {
        toast.success(t("lockboxDetail.panicCodeSuccess"));
        setShowPanicInput(false);
        setPanicCode("");
      } else {
        if (lockbox.panic_code_used) {
          setPanicError(t("lockboxDetail.panicCodeUsed"));
        } else {
          setPanicError(t("lockboxDetail.panicCodeInvalid"));
        }
      }
    } catch {
      setPanicError(t("lockboxDetail.panicCodeInvalid"));
    }
  };

  const cancelMessage = lockbox.penalty_enabled
    ? t("lockboxDetail.cancelWithPenaltyMessage", {
        penalty: formatDelay(lockbox.penalty_seconds),
      })
    : t("lockboxDetail.cancelConfirmMessage");

  const getTimerLabel = () => {
    if (status === "unlocking") return t("lockboxDetail.unlockIn");
    if (status === "scheduled") return t("lockboxDetail.scheduledIn");
    return t("lockboxDetail.relockIn");
  };

  const getTimerColor = () => {
    if (status === "scheduled")
      return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
    if (status === "unlocking")
      return "border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20";
    return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
  };

  const getTimerTextColor = () => {
    if (status === "scheduled") return "text-blue-700 dark:text-blue-300";
    if (status === "unlocking") return "text-primary-700 dark:text-primary-300";
    return "text-green-700 dark:text-green-300";
  };

  const formatLogDate = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const getLogLabel = (eventType: string): string => {
    const key = `accessLog.${eventType}` as Parameters<typeof t>[0];
    return t(key) || eventType;
  };

  const getLogColor = (eventType: string) => {
    switch (eventType) {
      case "unlock_completed":
        return "text-green-600 dark:text-green-400";
      case "unlock_cancelled":
        return "text-red-500 dark:text-red-400";
      case "panic_used":
        return "text-orange-500 dark:text-orange-400";
      case "extend_delay":
        return "text-blue-500 dark:text-blue-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div
          className={clsx(
            "p-3 rounded-xl shrink-0",
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
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {lockbox.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className={clsx(
                "inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white",
                getStatusColor(status),
              )}
            >
              {t(getStatusKey(status))}
            </span>
            {/* Penalty badge — below status, no tooltip repetition */}
            {lockbox.penalty_enabled && (
              <Tooltip
                content={t("lockboxDetail.penaltyTooltip", {
                  penalty: formatDelay(lockbox.penalty_seconds),
                })}
                position="bottom"
              >
                <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full cursor-help border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-3 w-3" />
                  {t("lockboxDetail.penaltyBadge", {
                    penalty: formatDelay(lockbox.penalty_seconds),
                  })}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Timer */}
      {timeRemaining && timeRemaining.total > 0 && (
        <div className={clsx("mb-4 p-4 rounded-xl border", getTimerColor())}>
          <div className={clsx("flex items-center gap-2", getTimerTextColor())}>
            <Clock className="h-5 w-5 animate-pulse" />
            <span className="font-medium">{getTimerLabel()}</span>
          </div>
          <p
            className={clsx(
              "text-3xl font-mono font-bold mt-2",
              getTimerTextColor().replace("700", "600").replace("300", "400"),
            )}
          >
            {formatTimeRemaining(timeRemaining)}
          </p>

          {/* Extend delay button (during countdown) */}
          {canCancel && (
            <button
              onClick={() => setShowExtendDelay(true)}
              className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {t("lockboxDetail.extendDelay")}
            </button>
          )}
        </div>
      )}

      {/* Scheduled date info */}
      {status === "scheduled" && lockbox.scheduled_unlock_at && (
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>
            {t("lockboxDetail.scheduledAt", {
              date: new Date(lockbox.scheduled_unlock_at).toLocaleString(),
            })}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("lockboxDetail.content")}
          </label>
          {isUnlocked && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowContent(!showContent)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={
                  showContent
                    ? t("lockboxDetail.hide")
                    : t("lockboxDetail.show")
                }
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

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl min-h-[100px] flex flex-col">
          {isUnlocked ? (
            isLoadingContent ? (
              <div className="flex flex-1 min-h-[60px] items-center justify-center text-gray-500 dark:text-gray-400">
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
            <div className="flex flex-1 min-h-[60px] items-center justify-center text-gray-500 dark:text-gray-400">
              <Lock className="h-5 w-5 mr-2 shrink-0" />
              <span>{t("lockboxDetail.contentLocked")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
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
        {lockbox.category && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("lockboxDetail.category")}
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {t(`category.${lockbox.category}` as "category.Passwords")}
            </p>
          </div>
        )}
        {parseTags(lockbox.tags).length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("tags.label")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {parseTags(lockbox.tags).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency panic code */}
      {lockbox.panic_code_hash && !isUnlocked && (
        <div className="relative z-20 mb-4">
          {!lockbox.panic_code_used ? (
            <div className="border-2 border-orange-400 dark:border-orange-600 rounded-lg shadow-md shadow-orange-100 dark:shadow-orange-900/30">
              <button
                onClick={() => setShowPanicInput(!showPanicInput)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 bg-orange-100 dark:bg-orange-900/40 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors text-sm",
                  showPanicInput ? "rounded-t-lg" : "rounded-lg",
                )}
              >
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200 font-medium">
                  <Zap className="h-4 w-4" />
                  <span>{t("lockboxDetail.panicCode")}</span>
                  <Tooltip
                    content={t("lockboxDetail.panicCodeTooltip")}
                    position="top"
                  >
                    <Info className="h-3.5 w-3.5 opacity-60" />
                  </Tooltip>
                </div>
                {showPanicInput ? (
                  <ChevronUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                )}
              </button>
              {showPanicInput && (
                <div className="p-3 space-y-2 bg-orange-50 dark:bg-gray-800 border-t border-orange-300 dark:border-orange-700 rounded-b-lg">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={panicCode}
                      onChange={(e) => {
                        setPanicCode(e.target.value);
                        setPanicError("");
                      }}
                      placeholder={t("lockboxDetail.panicCodePlaceholder")}
                      className="flex-1 px-3 py-1.5 text-sm border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUsePanicCode()
                      }
                    />
                    <button
                      onClick={handleUsePanicCode}
                      className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white transition-colors shadow-sm"
                    >
                      {t("lockboxDetail.usePanicCode")}
                    </button>
                  </div>
                  {panicError && (
                    <p className="text-xs text-red-500">{panicError}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Zap className="h-3.5 w-3.5" />
              {t("lockboxDetail.panicCodeUsed")}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {status === "locked" && (
          <>
            <Button
              onClick={() => setShowUnlockConfirm(true)}
              className="flex-1"
            >
              <Unlock className="h-4 w-4 mr-2" />
              {t("lockboxDetail.unlock")}
            </Button>
            <Tooltip
              content={t("lockboxDetail.extendDelayTooltip")}
              position="left"
            >
              <Button
                variant="secondary"
                onClick={() => setShowExtendDelay(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
        )}

        {(status === "unlocking" || status === "scheduled") && (
          <>
            <Button variant="secondary" className="flex-1" disabled>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              {status === "scheduled"
                ? t("status.scheduled")
                : t("lockboxDetail.unlocking")}
            </Button>
            <Tooltip
              content={t("lockboxDetail.cancelUnlockTooltip")}
              position="left"
            >
              <Button
                variant="danger"
                onClick={() => setShowCancelConfirm(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
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

      {/* Access log */}
      <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
        <button
          onClick={() => setShowAccessLog(!showAccessLog)}
          className="w-full flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {t("lockboxDetail.accessLog")}
          </div>
          {showAccessLog ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {showAccessLog && (
          <div className="mt-2 space-y-1">
            {accessLog.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center">
                {t("lockboxDetail.accessLogEmpty")}
              </p>
            ) : (
              accessLog.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span
                    className={clsx(
                      "font-medium",
                      getLogColor(entry.event_type),
                    )}
                  >
                    {getLogLabel(entry.event_type)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {formatLogDate(entry.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showUnlockConfirm}
        onClose={() => setShowUnlockConfirm(false)}
        onConfirm={handleUnlockConfirmed}
        title={t("lockboxDetail.unlockConfirmTitle")}
        message={t("lockboxDetail.unlockConfirmMessage", {
          delay: formatDelay(lockbox.unlock_delay_seconds),
        })}
        confirmText={t("lockboxDetail.unlock")}
        variant="warning"
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelUnlock}
        title={t("lockboxDetail.cancelConfirmTitle")}
        message={cancelMessage}
        confirmText={t("lockboxDetail.cancelUnlock")}
        variant={lockbox.penalty_enabled ? "danger" : "warning"}
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

      <ReflectionModal
        isOpen={showReflection}
        onConfirm={() => {
          setShowReflection(false);
          doUnlock();
        }}
        onCancel={() => setShowReflection(false)}
        message={lockbox.reflection_message}
        checklist={lockbox.reflection_checklist}
      />

      <ExtendDelayModal
        isOpen={showExtendDelay}
        onClose={() => setShowExtendDelay(false)}
        onConfirm={handleExtendDelay}
        currentDelaySeconds={lockbox.unlock_delay_seconds}
      />
    </div>
  );
};
