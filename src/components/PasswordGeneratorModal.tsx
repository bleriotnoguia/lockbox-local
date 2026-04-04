import React, { useState, useCallback } from "react";
import { RefreshCw, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useTranslation } from "../i18n";

function generatePassword(
  length: number,
  upper: boolean,
  numbers: boolean,
  symbols: boolean,
): string {
  let charset = "abcdefghijklmnopqrstuvwxyz";
  if (upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (numbers) charset += "0123456789";
  if (symbols) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => charset[x % charset.length]).join("");
}

function computeStrength(
  password: string,
  upper: boolean,
  numbers: boolean,
  symbols: boolean,
): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  // Character variety
  if (upper) score += 1;
  if (numbers) score += 1;
  if (symbols) score += 2;
  // Length bonus
  if (password.length >= 16) score += 1;
  if (password.length >= 24) score += 1;

  if (score <= 1) return { score: 1, label: "weak", color: "bg-red-500" };
  if (score <= 3) return { score: 2, label: "fair", color: "bg-yellow-400" };
  if (score <= 4) return { score: 3, label: "good", color: "bg-blue-500" };
  return { score: 4, label: "strong", color: "bg-green-500" };
}

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, shows "Use this password" button that fills a content field.
   *  When absent (standalone mode), the primary action copies to clipboard. */
  onUse?: (password: string) => void;
  /** Use 'high' when this modal is opened inside another modal */
  layer?: 'base' | 'high';
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
  onUse,
  layer = 'base',
}) => {
  const { t } = useTranslation();

  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerated(generatePassword(length, upper, numbers, symbols));
    setCopied(false);
  }, [length, upper, numbers, symbols]);

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = async () => {
    if (!generated) return;
    if (onUse) {
      onUse(generated);
      onClose();
    } else {
      await navigator.clipboard.writeText(generated);
      toast.success(t('passwordGenerator.copiedToast'));
      onClose();
    }
  };

  const strength = computeStrength(generated, upper, numbers, symbols);
  const strengthLabels: Record<string, string> = {
    weak: t("passwordGenerator.strengthWeak"),
    fair: t("passwordGenerator.strengthFair"),
    good: t("passwordGenerator.strengthGood"),
    strong: t("passwordGenerator.strengthStrong"),
  };

  const options = [
    {
      key: "upper",
      label: t("passwordGenerator.uppercase"),
      value: upper,
      set: setUpper,
    },
    {
      key: "numbers",
      label: t("passwordGenerator.numbers"),
      value: numbers,
      set: setNumbers,
    },
    {
      key: "symbols",
      label: t("passwordGenerator.symbols"),
      value: symbols,
      set: setSymbols,
    },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("passwordGenerator.title")}
      size="lg"
      layer={layer}
    >
      <div className="space-y-5">
        {/* Length */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("passwordGenerator.length")}
            </label>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 w-8 text-right tabular-nums">
              {length}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Character options */}
        <div className="grid grid-cols-3 gap-2">
          {options.map(({ key, label, value, set }) => (
            <label
              key={key}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                value
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="sr-only"
              />
              <span
                className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                  value
                    ? "bg-primary-600 border-primary-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {value && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    viewBox="0 0 10 10"
                  >
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              {label}
            </label>
          ))}
        </div>

        {/* Generated password + actions */}
        <div className="space-y-2">
          <div className="relative flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 min-h-[52px]">
            <p className="flex-1 font-mono text-sm text-gray-800 dark:text-gray-200 break-all leading-relaxed">
              {generated || (
                <span className="font-sans text-gray-400 dark:text-gray-500 text-xs">
                  {t("passwordGenerator.placeholder")}
                </span>
              )}
            </p>
            {generated && (
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={t("passwordGenerator.copy")}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Strength bar */}
          {generated && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      strength.score >= level
                        ? strength.color
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {strengthLabels[strength.label] ?? ""}
              </p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="secondary"
            onClick={handleGenerate}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("passwordGenerator.generate")}
          </Button>
          <Button onClick={handleUse} disabled={!generated} className="flex-1">
            {onUse ? t("passwordGenerator.usePassword") : t("passwordGenerator.copyAndClose")}
            {onUse ? <ArrowRight className="h-4 w-4 ml-2" /> : <Copy className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
