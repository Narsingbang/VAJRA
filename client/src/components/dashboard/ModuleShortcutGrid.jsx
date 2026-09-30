import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wheat,
  FlaskConical,
  Droplets,
  Bug,
  Calendar,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

export function ModuleShortcutGrid() {
  const { t } = useTranslation();

  const modules = [
    {
      key: 'crop_recommendation',
      icon: Wheat,
      color: 'from-amber-500 to-amber-600',
      bgHover: 'group-hover:border-amber-400',
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      key: 'fertilizer_plan',
      icon: FlaskConical,
      color: 'from-emerald-500 to-emerald-600',
      bgHover: 'group-hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      key: 'irrigation_schedule',
      icon: Droplets,
      color: 'from-blue-500 to-blue-600',
      bgHover: 'group-hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'pest_disease_diagnosis',
      icon: Bug,
      color: 'from-rose-500 to-rose-600',
      bgHover: 'group-hover:border-rose-400',
      iconBg: 'bg-rose-100 text-rose-800'
    },
    {
      key: 'seasonal_calendar',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgHover: 'group-hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'harvest_postharvest',
      icon: PackageCheck,
      color: 'from-teal-500 to-teal-600',
      bgHover: 'group-hover:border-teal-400',
      iconBg: 'bg-teal-100 text-teal-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((m) => {
        const Icon = m.icon;
        const title = t(`modules.${m.key}.title`);
        const desc = t(`modules.${m.key}.desc`);

        return (
          <Link
            key={m.key}
            to={`/advisory/new/${m.key}`}
            className={`group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${m.bgHover}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl ${m.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-brand-600 flex items-center gap-1 transition-colors">
                  Start <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {desc}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
