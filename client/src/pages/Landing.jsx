import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  ShieldCheck,
  Languages,
  Sparkles,
  ArrowRight,
  Wheat,
  Droplets,
  Bug,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ModuleShortcutGrid } from '../components/dashboard/ModuleShortcutGrid';

export function Landing() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white p-8 sm:p-14 lg:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>AI-Powered Agriculture Advisory for Indian Farmers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Smarter farming decisions for{' '}
            <span className="bg-gradient-to-r from-brand-300 to-emerald-200 bg-clip-text text-transparent">
              higher yields & safety
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
            {t('app.subtitle')} Tailored to your soil type, season, water availability, and state.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/signup">
              <Button size="lg" variant="primary" className="shadow-lg shadow-brand-500/30 font-semibold px-8" icon={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                Log In to Account
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Hindi, Marathi & English
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Multimodal Leaf Photo Diagnosis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Safe Organic & Chemical Guidance
            </span>
          </div>
        </div>
      </section>

      {/* 6 Modules Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Six Specialized Advisory Engines
          </h2>
          <p className="text-sm text-slate-600">
            Covering the complete crop lifecycle from seed selection to post-harvest storage.
          </p>
        </div>

        <ModuleShortcutGrid />
      </section>

      {/* Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">Safety-First Agronomy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All chemical recommendations follow government pesticide guidelines with pre-harvest intervals and mandatory protective gear reminders. Banned substances are strictly prohibited.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Languages className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">Regional Language Support</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Available in हिन्दी, मराठी, and English. The AI adapts technical terms to localized agricultural terminology understood by rural farming communities.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">Field & Soil Aware</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Advice changes dynamically based on black cotton soil, sandy loam, or red soil, and whether you rely on monsoon rains or canal irrigation.
          </p>
        </div>
      </section>
    </div>
  );
}
