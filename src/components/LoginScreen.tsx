import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuthStore } from '../store';

export const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
      setError('Le mot de passe est requis');
      return;
    }

    if (!isMasterPasswordSet) {
      // Setting up new password
      if (password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      await setMasterPassword(password);
    } else {
      // Verifying existing password
      const isValid = await verifyMasterPassword(password);
      if (!isValid) {
        setError('Mot de passe incorrect');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
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
              ? 'Entrez votre mot de passe maître'
              : 'Créez un mot de passe maître pour protéger vos données'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || authError) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error || authError}
            </div>
          )}

          <div className="relative">
            <Input
              label="Mot de passe maître"
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
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Minimum 8 caractères"
            />
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            <Lock className="h-4 w-4 mr-2" />
            {isMasterPasswordSet ? 'Déverrouiller' : 'Créer le mot de passe'}
          </Button>
        </form>

        {!isMasterPasswordSet && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            Ce mot de passe chiffrera toutes vos données localement.
            <br />
            <strong>Il ne peut pas être récupéré si vous l'oubliez.</strong>
          </p>
        )}
      </div>
    </div>
  );
};
