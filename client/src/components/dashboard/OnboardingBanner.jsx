import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function OnboardingBanner({ onDismiss }) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 text-white p-6 shadow-md shadow-brand-700/15 mb-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-brand-100 text-xs font-semibold backdrop-blur-sm mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('dashboard.onboarding_title')}</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Register your farm for hyper-local AI crop advice
          </h3>
          <p className="text-sm text-brand-100 mt-1 leading-relaxed">
            {t('dashboard.onboarding_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/farms">
            <Button
              variant="secondary"
              className="bg-white text-brand-800 hover:bg-brand-50 border-transparent shadow-md font-semibold"
              icon={MapPin}
            >
              {t('dashboard.add_farm_btn')}
            </Button>
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-brand-200 hover:text-white underline underline-offset-4"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
