import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuthStore } from '../store';
import { useTranslation } from '../i18n';

export const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { t, locale, setLocale } = useTranslation();

  const {
    isMasterPasswordSet,
    isLoading,
    setMasterPassword,
    verifyMasterPassword,
    error: authError,
  } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError(t('login.passwordRequired'));
      return;
    }

    if (!isMasterPasswordSet) {
      if (password.length < 8) {
        setError(t('login.passwordMinLength'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('login.passwordMismatch'));
        return;
      }
      await setMasterPassword(password);
    } else {
      const isValid = await verifyMasterPassword(password);
      if (!isValid) {
        setError(t('login.wrongPassword'));
      }
    }
  };

  const displayError =
    (authError?.startsWith('login.') ? t(authError as 'login.wrongPassword') : authError) || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        {/* Language switcher */}
        <div className="absolute top-4 right-4 flex gap-1">
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              locale === 'en' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-700'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale('fr')}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              locale === 'fr' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-700'
            }`}
          >
            FR
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lockbox Local
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
            {isMasterPasswordSet
              ? t('login.enterPassword')
              : t('login.createPassword')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {displayError}
            </div>
          )}

          <div className="relative">
            <Input
              label={t('login.masterPassword')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {!isMasterPasswordSet && (
            <Input
              label={t('login.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              helperText={t('login.minChars')}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            <Lock className="h-4 w-4 mr-2" />
            {isMasterPasswordSet ? t('login.unlock') : t('login.createPasswordButton')}
          </Button>
        </form>

        {!isMasterPasswordSet && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('login.passwordDisclaimer')}
            <br />
            <strong>{t('login.passwordWarning')}</strong>
          </p>
        )}
      </div>
    </div>
  );
};
