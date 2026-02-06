import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { useLockboxStore } from '../store';
import { CATEGORIES } from '../types';

interface CreateLockboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

export const CreateLockboxModal: React.FC<CreateLockboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [unlockDelay, setUnlockDelay] = useState(5);
  const [unlockUnit, setUnlockUnit] = useState<TimeUnit>('minutes');
  const [relockDelay, setRelockDelay] = useState(1);
  const [relockUnit, setRelockUnit] = useState<TimeUnit>('hours');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createLockbox = useLockboxStore((state) => state.createLockbox);

  const convertToSeconds = (value: number, unit: TimeUnit): number => {
    switch (unit) {
      case 'seconds':
        return value;
      case 'minutes':
        return value * 60;
      case 'hours':
        return value * 3600;
      case 'days':
        return value * 86400;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!content.trim()) {
      setError('Le contenu est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      await createLockbox({
        name: name.trim(),
        content: content.trim(),
        category: category || undefined,
        unlock_delay_seconds: convertToSeconds(unlockDelay, unlockUnit),
        relock_delay_seconds: convertToSeconds(relockDelay, relockUnit),
      });

      // Reset form
      setName('');
      setContent('');
      setCategory('');
      setUnlockDelay(5);
      setUnlockUnit('minutes');
      setRelockDelay(1);
      setRelockUnit('hours');
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeUnitOptions = [
    { value: 'seconds', label: 'Secondes' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Heures' },
    { value: 'days', label: 'Jours' },
  ];

  const categoryOptions = [
    { value: '', label: 'Aucune catégorie' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Lockbox" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mot de passe Netflix"
          required
        />

        <TextArea
          label="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Entrez le contenu à protéger..."
          rows={4}
          required
        />

        <Select
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Délai de déverrouillage
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={unlockDelay}
                onChange={(e) => setUnlockDelay(Number(e.target.value))}
                className="w-20"
              />
              <Select
                value={unlockUnit}
                onChange={(e) => setUnlockUnit(e.target.value as TimeUnit)}
                options={timeUnitOptions}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Temps d'attente avant de pouvoir accéder au contenu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Délai de reverrouillage
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={relockDelay}
                onChange={(e) => setRelockDelay(Number(e.target.value))}
                className="w-20"
              />
              <Select
                value={relockUnit}
                onChange={(e) => setRelockUnit(e.target.value as TimeUnit)}
                options={timeUnitOptions}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Temps avant que la lockbox se reverrouille automatiquement
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
