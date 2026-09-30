import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Info } from 'lucide-react';
import { ModuleShortcutGrid } from '../components/dashboard/ModuleShortcutGrid';

export function AdvisoryNew() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Structured AI Agronomy Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select an Advisory Module
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Each module generates structured, step-by-step guidance formatted specifically for your farm conditions.
        </p>
      </div>

      <ModuleShortcutGrid />

      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold">Photo Diagnosis Tip:</span>
          <p className="text-amber-800">
            For pest and disease identification, uploading clear, close-up photos of the affected leaf, stem, or fruit in good daylight will significantly improve AI diagnosis accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
