import React, { useState } from "react";
import {
  Github,
  Coffee,
  Copy,
  ExternalLink,
  Heart,
  Shield,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { open } from "@tauri-apps/plugin-shell";
import { Modal } from "./ui/Modal";
import { useTranslation } from "../i18n";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_VERSION = "2.3.0";
const GITHUB_URL = "https://github.com/bleriotnoguia/lockbox-local";
const BUG_URL = "https://github.com/bleriotnoguia/lockbox-local/issues";
const BUY_ME_COFFEE_URL = "https://ko-fi.com/bleriotnoguia";
const X_URL = "https://x.com/bleriotnoguia";
const SUPPORT_EMAIL = "contact@bleriotnoguia.com";

const BTC_ADDRESS = "bc1qejaecc7mfyg5vklzlp9s0kd4z45t0kycehk4ja";
const ADA_ADDRESS =
  "addr1q8mprm9a2kkxkmasjln8lptu682uqawqtyv4u7865wxet6h96p8d77p6pzsh4q74cfl5mmt6mwxksnfasd437h38uxzsntjfe5";
const SOL_ADDRESS = "DUp9FzfPG2QfWNmWq3rJxed5b41FK92An6d9MpyjLBbC";

interface CopyAddressProps {
  label: string;
  address: string;
}

const CopyAddress: React.FC<CopyAddressProps> = ({ label, address }) => {
  const { t } = useTranslation();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success(t("about.copiedAddress"));
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1.5 rounded-lg font-mono text-gray-700 dark:text-gray-300 truncate">
          {address}
        </code>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [showCrypto, setShowCrypto] = useState(false);

  const openExternal = async (url: string) => {
    try {
      await open(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("about.title")} size="md">
      <div className="space-y-5">
        {/* App info */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              Lockbox Local
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("about.version")} {APP_VERSION}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {t("about.licenseMIT")}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {t("about.description")}
        </p>

        {/* Privacy note */}
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            {t("about.privacyNote")}
          </p>
        </div>

        {/* Developer */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("about.developer")}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
            {t("about.developerName")}
            <b
              onClick={() => openExternal(`mailto:${SUPPORT_EMAIL}`)}
              className="text-sm font-medium text-gray-900 dark:text-white underline flex items-center gap-1 cursor-pointer"
            >
              {" ( " + SUPPORT_EMAIL + " )"}{" "}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </b>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => openExternal(GITHUB_URL)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              {t("about.github")}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
            <button
              onClick={() => openExternal(X_URL)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t("about.x")}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
            <button
              onClick={() => openExternal(BUG_URL)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t("about.reportBug")}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("about.support")}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("about.supportDescription")}
          </p>
          <button
            onClick={() => openExternal(BUY_ME_COFFEE_URL)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            <Coffee className="h-4 w-4" />
            {t("about.buyMeCoffee")}
            <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
          </button>

          <button
            onClick={() => setShowCrypto(!showCrypto)}
            className="flex items-center gap-2 px-4 py-2 w-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Heart className="h-4 w-4" />
            {t("about.crypto")}
          </button>

          {showCrypto && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <CopyAddress
                label={t("about.btcAddress")}
                address={BTC_ADDRESS}
              />
              <CopyAddress
                label={t("about.adaAddress")}
                address={ADA_ADDRESS}
              />
              <CopyAddress
                label={t("about.solAddress")}
                address={SOL_ADDRESS}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
