import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Clock,
  Brain,
  AlertTriangle,
  Calendar,
  Activity,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { useTranslation } from '../i18n';

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ icon, title, description }) => (
  <div className="flex gap-3">
    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg h-fit shrink-0">
      <span className="text-primary-600 dark:text-primary-400">{icon}</span>
    </div>
    <div>
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export const DocModal: React.FC<DocModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const features = [
    { icon: <Lock className="h-4 w-4" />, text: t('doc.feature1') },
    { icon: <Brain className="h-4 w-4" />, text: t('doc.feature2') },
    { icon: <AlertTriangle className="h-4 w-4" />, text: t('doc.feature3') },
    { icon: <Unlock className="h-4 w-4" />, text: t('doc.feature4') },
    { icon: <Calendar className="h-4 w-4" />, text: t('doc.feature5') },
    { icon: <Activity className="h-4 w-4" />, text: t('doc.feature6') },
  ];

  const tips = [
    t('doc.tip1'),
    t('doc.tip2'),
    t('doc.tip3'),
    t('doc.tip4'),
    t('doc.tip5'),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('doc.title')} size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Intro */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('doc.intro')}
        </p>

        {/* Steps */}
        <CollapsibleSection title="Guide d'utilisation" defaultOpen>
          <div className="space-y-4">
            <Step
              icon={<Lock className="h-4 w-4" />}
              title={t('doc.step1Title')}
              description={t('doc.step1')}
            />
            <Step
              icon={<Unlock className="h-4 w-4" />}
              title={t('doc.step2Title')}
              description={t('doc.step2')}
            />
            <Step
              icon={<Clock className="h-4 w-4" />}
              title={t('doc.step3Title')}
              description={t('doc.step3')}
            />
            <Step
              icon={<Activity className="h-4 w-4" />}
              title={t('doc.step4Title')}
              description={t('doc.step4')}
            />
          </div>
        </CollapsibleSection>

        {/* Features */}
        <CollapsibleSection title={t('doc.featuresTitle')}>
          <ul className="space-y-2">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Tips */}
        <CollapsibleSection title={t('doc.tipsTitle')}>
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    </Modal>
  );
};
